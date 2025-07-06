import { describe, it, expect, vi } from 'vitest'
import {
  ensureArray,
  validateApiResponse,
  getUserFriendlyErrorMessage,
  validateRequiredFields,
  extractSupabaseData
} from '@/utils/dataValidation'

describe('dataValidation utilities', () => {
  describe('ensureArray', () => {
    it('returns the array when valid array is provided', () => {
      const testArray = [1, 2, 3]
      expect(ensureArray(testArray)).toBe(testArray)
    })

    it('returns empty array when null is provided', () => {
      expect(ensureArray(null)).toEqual([])
    })

    it('returns empty array when undefined is provided', () => {
      expect(ensureArray(undefined)).toEqual([])
    })

    it('returns custom default when provided', () => {
      const defaultValue = ['default']
      expect(ensureArray(null, defaultValue)).toBe(defaultValue)
    })

    it('logs warning for non-array data', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      ensureArray('not an array' as any)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️ [dataValidation] Non-array data detected, returning default:',
        { data: 'not an array', defaultValue: [] }
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('validateApiResponse', () => {
    it('returns valid data and no error for successful response', () => {
      const testData = [{ id: 1 }, { id: 2 }]
      const response = { data: testData, error: null }
      
      const result = validateApiResponse(response)
      
      expect(result).toEqual({
        data: testData,
        error: null,
        hasError: false
      })
    })

    it('returns empty array and error for failed response', () => {
      const testError = new Error('API failed')
      const response = { data: null, error: testError }
      
      const result = validateApiResponse(response)
      
      expect(result).toEqual({
        data: [],
        error: testError,
        hasError: true
      })
    })

    it('handles undefined data gracefully', () => {
      const response = { data: undefined, error: null }
      
      const result = validateApiResponse(response)
      
      expect(result).toEqual({
        data: [],
        error: null,
        hasError: false
      })
    })

    it('handles missing data property', () => {
      const response = { error: null } as any
      
      const result = validateApiResponse(response)
      
      expect(result).toEqual({
        data: [],
        error: null,
        hasError: false
      })
    })
  })

  describe('getUserFriendlyErrorMessage', () => {
    it('returns default message for null error', () => {
      expect(getUserFriendlyErrorMessage(null)).toBe('An unexpected error occurred. Please try again.')
    })

    it('returns custom default message', () => {
      const customDefault = 'Custom error message'
      expect(getUserFriendlyErrorMessage(null, customDefault)).toBe(customDefault)
    })

    it('returns string error as-is', () => {
      const errorMessage = 'String error message'
      expect(getUserFriendlyErrorMessage(errorMessage)).toBe(errorMessage)
    })

    it('returns userMessage from DatabaseError', () => {
      const error = {
        userMessage: 'User-friendly message',
        message: 'Technical message'
      }
      expect(getUserFriendlyErrorMessage(error)).toBe('User-friendly message')
    })

    it('falls back to message property', () => {
      const error = {
        message: 'Error message from property'
      }
      expect(getUserFriendlyErrorMessage(error)).toBe('Error message from property')
    })

    it('handles PostgreSQL error codes', () => {
      const uniqueViolationError = { code: '23505' }
      expect(getUserFriendlyErrorMessage(uniqueViolationError))
        .toBe('This action has already been completed.')

      const foreignKeyError = { code: '23503' }
      expect(getUserFriendlyErrorMessage(foreignKeyError))
        .toBe('Invalid information provided.')

      const notFoundError = { code: 'PGRST116' }
      expect(getUserFriendlyErrorMessage(notFoundError))
        .toBe('The requested information was not found.')
    })

    it('returns default for unhandled error codes', () => {
      const unknownError = { code: '99999' }
      expect(getUserFriendlyErrorMessage(unknownError))
        .toBe('An unexpected error occurred. Please try again.')
    })
  })

  describe('validateRequiredFields', () => {
    it('returns valid for object with all required fields', () => {
      const obj = { name: 'John', email: 'john@example.com', age: 30 }
      const required = ['name', 'email']
      
      const result = validateRequiredFields(obj, required)
      
      expect(result).toEqual({
        isValid: true,
        missingFields: []
      })
    })

    it('returns invalid with missing fields', () => {
      const obj = { name: 'John', email: '' }
      const required = ['name', 'email', 'phone']
      
      const result = validateRequiredFields(obj, required)
      
      expect(result).toEqual({
        isValid: false,
        missingFields: ['email', 'phone']
      })
    })

    it('treats null values as missing', () => {
      const obj = { name: null, email: 'test@example.com' }
      const required = ['name', 'email']
      
      const result = validateRequiredFields(obj, required)
      
      expect(result).toEqual({
        isValid: false,
        missingFields: ['name']
      })
    })

    it('treats undefined values as missing', () => {
      const obj = { name: undefined, email: 'test@example.com' }
      const required = ['name', 'email']
      
      const result = validateRequiredFields(obj, required)
      
      expect(result).toEqual({
        isValid: false,
        missingFields: ['name']
      })
    })

    it('treats empty strings as missing', () => {
      const obj = { name: '', email: 'test@example.com' }
      const required = ['name', 'email']
      
      const result = validateRequiredFields(obj, required)
      
      expect(result).toEqual({
        isValid: false,
        missingFields: ['name']
      })
    })
  })

  describe('extractSupabaseData', () => {
    it('extracts array data successfully', () => {
      const testData = [{ id: 1 }, { id: 2 }]
      const response = { data: testData, error: null }
      
      const result = extractSupabaseData(response)
      
      expect(result).toEqual({
        data: testData,
        error: null,
        hasError: false
      })
    })

    it('converts single object to array', () => {
      const testData = { id: 1, name: 'Test' }
      const response = { data: testData, error: null }
      
      const result = extractSupabaseData(response)
      
      expect(result).toEqual({
        data: [testData],
        error: null,
        hasError: false
      })
    })

    it('handles null data', () => {
      const response = { data: null, error: null }
      
      const result = extractSupabaseData(response)
      
      expect(result).toEqual({
        data: [],
        error: null,
        hasError: false
      })
    })

    it('handles error responses', () => {
      const testError = new Error('Database error')
      const response = { data: null, error: testError }
      
      const result = extractSupabaseData(response)
      
      expect(result).toEqual({
        data: [],
        error: testError,
        hasError: true,
        userMessage: 'Database error'
      })
    })

    it('handles undefined data', () => {
      const response = { data: undefined, error: null }
      
      const result = extractSupabaseData(response)
      
      expect(result).toEqual({
        data: [],
        error: null,
        hasError: false
      })
    })

    it('provides user-friendly error messages', () => {
      const postgresError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      }
      const response = { data: null, error: postgresError }
      
      const result = extractSupabaseData(response)
      
      expect(result.hasError).toBe(true)
      expect(result.userMessage).toBe('This action has already been completed.')
    })
  })
})