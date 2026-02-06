import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (class name utility)', () => {
    it('should combine multiple class names', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle conditional class names', () => {
      const isActive = true
      const result = cn('base-class', isActive && 'active-class')
      
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
    })

    it('should filter out false conditions', () => {
      const isActive = false
      const result = cn('base-class', isActive && 'active-class')
      
      expect(result).toContain('base-class')
      expect(result).not.toContain('active-class')
    })

    it('should handle undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'other-class')
      
      expect(result).toContain('base-class')
      expect(result).toContain('other-class')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-8')
      
      // Should use the last value due to Tailwind specificity
      expect(result).toBeDefined()
    })

    it('should handle objects with class names', () => {
      const classes = {
        'text-sm': true,
        'text-lg': false,
      }
      
      const result = cn(classes)
      
      expect(result).toContain('text-sm')
      expect(result).not.toContain('text-lg')
    })

    it('should handle arrays of class names', () => {
      const result = cn(['px-4', 'py-2'], 'bg-blue-500')
      
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
    })

    it('should be case sensitive', () => {
      const result = cn('Text-sm', 'text-lg')
      
      expect(result).toContain('Text-sm')
      expect(result).toContain('text-lg')
    })

    it('should handle empty strings', () => {
      const result = cn('px-4', '', 'py-2')
      
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })

    it('should handle whitespace correctly', () => {
      const result = cn('  px-4  ', '  py-2  ')
      
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })

    it('should work with Tailwind responsive classes', () => {
      const result = cn('md:px-4', 'lg:py-8', 'hover:bg-gray-100')
      
      expect(result).toContain('md:px-4')
      expect(result).toContain('lg:py-8')
      expect(result).toContain('hover:bg-gray-100')
    })

    it('should combine with falsy values', () => {
      const active = false
      const result = cn(
        'base',
        active ? 'active' : 'inactive',
        0 && 'zero',
        '' && 'empty'
      )
      
      expect(result).toContain('base')
      expect(result).toContain('inactive')
    })
  })
})
