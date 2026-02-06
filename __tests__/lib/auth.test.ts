import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(typeof hashedPassword).toBe('string')
    })

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(100)
      const hashedPassword = await hashPassword(longPassword)

      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
    })

    it('should handle special characters in password', async () => {
      const specialPassword = 'P@$$w0rd!#%&*()[]{}|\\:;"\'<>,.?/'
      const hashedPassword = await hashPassword(specialPassword)

      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
    })

    it('should handle empty string', async () => {
      const emptyPassword = ''
      const hashedPassword = await hashPassword(emptyPassword)

      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
    })
  })

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword(password, hashedPassword)

      expect(isValid).toBe(true)
    })

    it('should reject an incorrect password', async () => {
      const password = 'testPassword123'
      const wrongPassword = 'wrongPassword456'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hashedPassword)

      expect(isValid).toBe(false)
    })

    it('should be case sensitive', async () => {
      const password = 'TestPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword('testpassword123', hashedPassword)

      expect(isValid).toBe(false)
    })

    it('should reject empty password when hash exists', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword('', hashedPassword)

      expect(isValid).toBe(false)
    })

    it('should handle special characters', async () => {
      const specialPassword = 'P@$$w0rd!#%&*'
      const hashedPassword = await hashPassword(specialPassword)
      const isValid = await verifyPassword(specialPassword, hashedPassword)

      expect(isValid).toBe(true)
    })

    it('should handle whitespace in password', async () => {
      const passwordWithSpace = 'test Password 123'
      const hashedPassword = await hashPassword(passwordWithSpace)
      const isValid = await verifyPassword(passwordWithSpace, hashedPassword)

      expect(isValid).toBe(true)
    })

    it('should not verify with extra whitespace', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      const isValid = await verifyPassword('testPassword123 ', hashedPassword)

      expect(isValid).toBe(false)
    })
  })

  describe('Password Hashing Security', () => {
    it('should produce hashes longer than original password', async () => {
      const password = 'short'
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword.length).toBeGreaterThan(password.length)
    })

    it('should use salting (different hash each time)', async () => {
      const password = 'testPassword123'
      const hashes = await Promise.all([
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
      ])

      // All hashes should be different due to salting
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(3)
    })

    it('should handle unicode characters', async () => {
      const unicodePassword = 'تست🔐密码'
      const hashedPassword = await hashPassword(unicodePassword)
      const isValid = await verifyPassword(unicodePassword, hashedPassword)

      expect(isValid).toBe(true)
    })
  })
})
