
import { register, login, logout, updateProfile } from '@/app/actions/auth'
import * as authLib from '@/lib/auth'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/auth', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    deleteSession: jest.fn(),
    getSession: jest.fn(),
    updateUserProfile: jest.fn(),
    verifyPassword: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
    sql: jest.fn(),
}))
// Note: We need to mock @/lib/db just in case, though updateProfile does dynamic import. 
// Jest might struggle with dynamic imports if not configured, but let's see.

describe('Auth Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('register', () => {
        it('should fail with missing fields', async () => {
            const formData = new FormData()
            formData.append('email', '')

            const result = await register(formData)

            expect(result.error).toContain('Semua field harus diisi')
            expect(authLib.registerUser).not.toHaveBeenCalled()
        })

        it('should fail with short password', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', '123') // too short
            formData.append('name', 'Test')
            formData.append('role', 'penanya')

            const result = await register(formData)

            expect(result.error).toContain('minimal 6 karakter')
        })

        it('should register and login successfully', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')
            formData.append('name', 'Test User')
            formData.append('role', 'penanya')

                ; (authLib.registerUser as jest.Mock).mockResolvedValue({ success: true, user: { id: 1 } })
                ; (authLib.loginUser as jest.Mock).mockResolvedValue({ success: true })

            try {
                await register(formData)
            } catch (e) {
                // redirect throws an error in Next.js, catch it to verify
            }

            expect(authLib.registerUser).toHaveBeenCalled()
            expect(authLib.loginUser).toHaveBeenCalled()
            expect(redirect).toHaveBeenCalledWith('/dashboard/penanya')
        })

        it('should handle registration failure', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')
            formData.append('name', 'Test User')
            formData.append('role', 'penanya')

                ; (authLib.registerUser as jest.Mock).mockResolvedValue({ success: false, error: 'Fail' })

            const result = await register(formData)

            expect(result.error).toBe('Fail')
            expect(redirect).not.toHaveBeenCalled()
        })
    })

    describe('login', () => {
        it('should fail with missing fields', async () => {
            const formData = new FormData()
            const result = await login(formData)
            expect(result).toHaveProperty('error')
        })

        it('should login successfully and redirect', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'password123')

                ; (authLib.loginUser as jest.Mock).mockResolvedValue({
                    success: true,
                    user: { role: 'penjawab' }
                })

            try {
                await login(formData)
            } catch (e) { }

            expect(authLib.loginUser).toHaveBeenCalled()
            expect(redirect).toHaveBeenCalledWith('/dashboard/penjawab')
        })

        it('should return error on login failure', async () => {
            const formData = new FormData()
            formData.append('email', 'test@example.com')
            formData.append('password', 'wrong')

                ; (authLib.loginUser as jest.Mock).mockResolvedValue({ success: false, error: 'Invalid' })

            const result = await login(formData)

            expect(result.error).toBe('Invalid')
            expect(redirect).not.toHaveBeenCalled()
        })
    })

    describe('logout', () => {
        it('should delete session and redirect', async () => {
            try {
                await logout()
            } catch (e) { }

            expect(authLib.deleteSession).toHaveBeenCalled()
            expect(redirect).toHaveBeenCalledWith('/login')
        })
    })

    // Note: updateProfile is complex due to dynamic imports. 
    // We might skip testing it fully here without configuring complex mocks for dynamic imports.
    // But we can test basic validations.
    describe('updateProfile', () => {
        it('should fail if not authorized', async () => {
            ; (authLib.getSession as jest.Mock).mockResolvedValue(null)

            const formData = new FormData()
            const result = await updateProfile(formData)

            expect(result.error).toBe('Unauthorized')
        })

        it('should validate required fields', async () => {
            ; (authLib.getSession as jest.Mock).mockResolvedValue({ user: { id: 1 } })

            const formData = new FormData()
            // Missing email/name

            const result = await updateProfile(formData)

            expect(result.error).toContain('Nama dan email harus diisi')
        })
    })
})
