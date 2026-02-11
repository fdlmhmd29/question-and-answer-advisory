
import {
    createQuestion,
    getQuestions,
    answerQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
} from '@/lib/questions'
import { neon } from '@neondatabase/serverless'

// Mock dependencies
jest.mock('@neondatabase/serverless', () => ({
    neon: jest.fn(() => jest.fn()),
}))

describe('Questions Library', () => {
    let mockSql: jest.Mock
    // We keep a reference to the unsafe mock to verify calls
    let mockUnsafe: jest.Mock

    beforeAll(() => {
        const neonMock = neon as unknown as jest.Mock
        if (neonMock.mock.results.length > 0) {
            mockSql = neonMock.mock.results[0].value
        } else {
            mockSql = jest.fn()
            console.warn('neon mock not called, using fallback mockSql')
        }

        // Attach unsafe to the mockSql object permanently
        mockUnsafe = jest.fn(() => '')
            ; (mockSql as any).unsafe = mockUnsafe
    })

    beforeEach(() => {
        // Clear calls, but don't reset implementation completely if it wipes properties
        jest.clearAllMocks()
        mockSql.mockClear()
        mockUnsafe.mockClear()

        // Reset default implementation
        mockSql.mockResolvedValue([])
        mockUnsafe.mockReturnValue('')
    })

    describe('createQuestion', () => {
        it('should create a question successfully', async () => {
            const newQuestion = {
                id: 'q-1',
                divisi_instansi: 'IT',
                nama_pemohon: 'User',
                unit_bisnis: 'Business',
                data_informasi: 'Info',
                advisory_diinginkan: 'Advice',
                jenis_advisory: ['Technical'],
            }

            mockSql.mockResolvedValueOnce([newQuestion])

            const result = await createQuestion('user-1', {
                divisi_instansi: 'IT',
                nama_pemohon: 'User',
                unit_bisnis: 'Business',
                data_informasi: 'Info',
                advisory_diinginkan: 'Advice',
                jenis_advisory: ['Technical'],
            })

            expect(result.success).toBe(true)
            expect(result.question).toEqual(newQuestion)
            expect(mockSql).toHaveBeenCalled()
        })

        it('should handle creation error', async () => {
            mockSql.mockRejectedValue(new Error('DB Error'))

            const result = await createQuestion('user-1', {
                divisi_instansi: '', nama_pemohon: '', unit_bisnis: '',
                data_informasi: '', advisory_diinginkan: '', jenis_advisory: []
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('Gagal membuat pertanyaan')
        })
    })

    describe('getQuestions', () => {
        it('should return questions with pagination', async () => {
            // Mock count query
            mockSql.mockResolvedValueOnce([{ count: '10' }])
            // Mock list query
            const mockQuestions = [
                { id: 'q-1', tanggal_permohonan: new Date(), created_at: new Date(), updated_at: new Date() },
                { id: 'q-2', tanggal_permohonan: new Date(), created_at: new Date(), updated_at: new Date() },
            ]
            mockSql.mockResolvedValueOnce(mockQuestions)

            const result = await getQuestions('user-1', 'penanya', { page: 1 })

            expect(result.totalCount).toBe(10)
            expect(result.totalPages).toBe(2) // 10 / 5 items per page
            expect(result.questions).toHaveLength(2)
        })

        it('should filter by status', async () => {
            mockSql.mockResolvedValueOnce([{ count: '5' }])
            mockSql.mockResolvedValueOnce([])

            await getQuestions('user-1', 'penanya', { status: 'belum_dijawab' })

            // Check if sql.unsafe was called
            expect(mockUnsafe).toHaveBeenCalled()
        })
    })

    describe('answerQuestion', () => {
        it('should answer a pending question successfully', async () => {
            // Mock check question
            mockSql.mockResolvedValueOnce([{ id: 'q-1', status: 'belum_dijawab' }])
            // Mock insert answer
            const newAnswer = { id: 'a-1' }
            mockSql.mockResolvedValueOnce([newAnswer])
            // Mock update question status
            mockSql.mockResolvedValueOnce([])

            const result = await answerQuestion('q-1', 'answerer-1', {
                no_registrasi: '001',
                technical_advisory_note: 'Note'
            })

            expect(result.success).toBe(true)
            expect(result.answer).toEqual(newAnswer)
        })

        it('should fail if question already answered', async () => {
            // Mock check question
            mockSql.mockResolvedValueOnce([{ id: 'q-1', status: 'dijawab' }])

            const result = await answerQuestion('q-1', 'answerer-1', {
                no_registrasi: '001',
                technical_advisory_note: 'Note'
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('sudah dijawab')
        })

        it('should fail if question validation fails', async () => {
            // Question not found
            mockSql.mockResolvedValueOnce([])

            const result = await answerQuestion('q-1', 'answerer-1', {
                no_registrasi: '001',
                technical_advisory_note: 'Note'
            })

            expect(result.error).toContain('tidak ditemukan')
        })
    })

    describe('updateQuestion', () => {
        it('should update question successfully', async () => {
            // Mock fetch old question
            mockSql.mockResolvedValueOnce([{
                id: 'q-1',
                divisi_instansi: 'Old',
                nama_pemohon: 'Old Name',
                status: 'belum_dijawab'
            }])

            // Mock update query
            mockSql.mockResolvedValueOnce([])

            // Mock history inserts (potentially multiple calls)
            mockSql.mockResolvedValue([])

            const result = await updateQuestion('q-1', 'user-1', {
                divisi_instansi: 'New',
                nama_pemohon: 'Old Name', // Unchanged
                unit_bisnis: 'Unit',
                data_informasi: 'Info',
                advisory_diinginkan: 'Advice',
                jenis_advisory: ['Tech']
            })

            expect(result.success).toBe(true)
        })

        it('should fail if question not found or already answered', async () => {
            mockSql.mockResolvedValueOnce([]) // Not found

            const result = await updateQuestion('q-1', 'user-1', {
                divisi_instansi: 'New',
                nama_pemohon: 'Name',
                unit_bisnis: 'Unit',
                data_informasi: 'Info',
                advisory_diinginkan: 'Advice',
                jenis_advisory: ['Tech']
            })

            expect(result.success).toBe(false)
            expect(result.error).toContain('tidak ditemukan')
        })
    })

    describe('deleteQuestion', () => {
        it('should delete pending question', async () => {
            mockSql.mockResolvedValueOnce([{ id: 'q-1' }]) // Returing deleted id

            const result = await deleteQuestion('q-1', 'user-1')

            expect(result.success).toBe(true)
        })

        it('should fail if delete returns no rows', async () => {
            mockSql.mockResolvedValueOnce([])

            const result = await deleteQuestion('q-1', 'user-1')

            expect(result.success).toBe(false)
        })
    })
})
