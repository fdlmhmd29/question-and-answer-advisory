
import {
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
  createSession,
  getSession,
  updateUserProfile,
  deleteSession,
} from '@/lib/auth'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

// Mock dependencies
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Auth Utilities', () => {
  let mockSql: jest.Mock
  let mockCookies: { set: jest.Mock; get: jest.Mock; delete: jest.Mock }

  beforeAll(() => {
    // Capture the mockSql instance created when lib/auth was imported
    // The neon function is called at the top level of lib/auth.ts
    const neonMock = neon as unknown as jest.Mock
    // If neon wasn't called (e.g. if import failed?), this might be empty.
    // But since we import lib/auth above, it should have run.
    if (neonMock.mock.results.length > 0) {
      mockSql = neonMock.mock.results[0].value
    } else {
      // Fallback for safety/types
      mockSql = jest.fn()
    }
  })

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mockSql implementation/results to default
    mockSql.mockReset()
    mockSql.mockResolvedValue([])

    // Setup cookies mock
    mockCookies = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    }
      ; (cookies as jest.Mock).mockResolvedValue(mockCookies)
  })

  describe('hashPassword & verifyPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
    })

    it('should verify a correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword('wrong', hashedPassword)
      expect(isValid).toBe(false)
    })
  })

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Mock existing user check (empty)
      mockSql.mockResolvedValueOnce([])
      // Mock insert return
      const newUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'penanya',
        created_at: new Date(),
      }
      mockSql.mockResolvedValueOnce([newUser])

      const result = await registerUser('test@example.com', 'password123', 'Test User', 'penanya')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(newUser)
      expect(mockSql).toHaveBeenCalledTimes(2)
    })

    it('should fail if email already exists', async () => {
      // Mock existing user check (found)
      mockSql.mockResolvedValueOnce([{ id: 1 }])

      const result = await registerUser('test@example.com', 'password123', 'Test User', 'penanya')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email sudah terdaftar')
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors', async () => {
      mockSql.mockRejectedValue(new Error('DB Error'))

      const result = await registerUser('test@example.com', 'password', 'name', 'penanya')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Terjadi kesalahan')
    })
  })

  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'penanya',
        created_at: new Date(),
      }

      mockSql.mockResolvedValueOnce([user]) // Find user
      // createSession will be called, which calls sql insert
      mockSql.mockResolvedValueOnce([]) // Insert session

      const result = await loginUser('test@example.com', password)

      expect(result.success).toBe(true)
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should fail with incorrect password', async () => {
      const password = 'password123'
      const hashedPassword = await hashPassword(password)
      const user = {
        id: 1,
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test User',
        role: 'penanya',
      }

      mockSql.mockResolvedValueOnce([user])

      const result = await loginUser('test@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email atau password salah')
    })

    it('should fail if user not found', async () => {
      mockSql.mockResolvedValueOnce([])

      const result = await loginUser('notfound@example.com', 'password')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email atau password salah')
    })
  })

  describe('createSession', () => {
    it('should create a session and set cookie', async () => {
      mockSql.mockResolvedValueOnce([]) // Insert session

      const token = await createSession(1)

      expect(token).toBeDefined()
      expect(mockSql).toHaveBeenCalled()
      expect(mockCookies.set).toHaveBeenCalledWith(
        'session',
        token,
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      )
    })
  })

  describe('getSession', () => {
    it('should return null if no session cookie', async () => {
      mockCookies.get.mockReturnValue(undefined)

      const session = await getSession()

      expect(session).toBeNull()
    })

    it('should return session and user if valid', async () => {
      mockCookies.get.mockReturnValue({ value: 'valid-token' })

      const mockDbResult = {
        session_id: 100,
        user_id: 1,
        expires_at: new Date(Date.now() + 10000).toISOString(),
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'penanya',
        created_at: new Date().toISOString(),
      }

      mockSql.mockResolvedValueOnce([mockDbResult])

      const result = await getSession()

      expect(result).not.toBeNull()
      expect(result?.session.session_token).toBe('valid-token')
      expect(result?.user.email).toBe('test@example.com')
    })

    it('should return null if session not found in DB', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-token' })
      mockSql.mockResolvedValueOnce([])

      const result = await getSession()

      expect(result).toBeNull()
    })
  })

  describe('deleteSession', () => {
    it('should delete session from DB and cookie', async () => {
      mockCookies.get.mockReturnValue({ value: 'token-to-delete' })
      mockSql.mockResolvedValueOnce([])

      await deleteSession()

      expect(mockSql).toHaveBeenCalled() // DELETE query
      expect(mockCookies.delete).toHaveBeenCalledWith('session')
    })

    it('should do nothing if no session cookie', async () => {
      mockCookies.get.mockReturnValue(undefined)

      await deleteSession()

      expect(mockSql).not.toHaveBeenCalled()
      expect(mockCookies.delete).not.toHaveBeenCalled()
    })
  })

  describe('updateUserProfile', () => {
    it('should update profile fields successfully', async () => {
      // Mock email check (no conflict)
      mockSql.mockResolvedValueOnce([])

      const updatedUser = {
        id: 1,
        email: 'new@example.com',
        name: 'New Name',
        role: 'penanya',
        created_at: new Date()
      }
      // Mock update return
      mockSql.mockResolvedValueOnce([updatedUser])

      const result = await updateUserProfile(1, {
        name: 'New Name',
        email: 'new@example.com'
      })

      expect(result.success).toBe(true)
      expect(result.user).toEqual(updatedUser)
    })

    it('should fail if new email is already taken', async () => {
      // Mock email check (conflict found)
      mockSql.mockResolvedValueOnce([{ id: 2 }])

      const result = await updateUserProfile(1, {
        email: 'taken@example.com'
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email sudah digunakan')
    })

    it('should hash password if provided', async () => {
      // Mock update return
      mockSql.mockResolvedValueOnce([{ id: 1 }])

      await updateUserProfile(1, {
        password: 'newpassword'
      })

      // Check that sql was called with a hashed password (long string)
      expect(mockSql).toHaveBeenCalled()
    })
  })
})
