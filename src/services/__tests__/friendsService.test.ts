import { describe, it, expect, vi, beforeEach } from 'vitest'
import { friendsService } from '@/services/friendsService'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
  channel: vi.fn(),
}

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}))

// Mock crypto for uuid generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-12345'
  }
})

describe('friendsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFriends', () => {
    it('returns empty array when no friendships exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)
      mockQuery.is.mockResolvedValueOnce({ data: [], error: null })

      const result = await friendsService.getFriends('user-id')
      
      expect(result).toEqual([])
      expect(mockSupabase.from).toHaveBeenCalledWith('friendships')
    })

    it('handles database errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
      }
      
      const dbError = new Error('Database connection failed')
      
      mockSupabase.from.mockReturnValue(mockQuery)
      mockQuery.is.mockResolvedValueOnce({ data: null, error: dbError })

      await expect(friendsService.getFriends('user-id')).rejects.toThrow('Failed to fetch friendships: Database connection failed')
    })

    it('returns valid array even with malformed profile data', async () => {
      const mockFriendships = [
        {
          id: 'friendship-1',
          friend_id: 'friend-1',
          status: 'accepted',
          notes: null,
          favorite: false,
          created_at: '2023-01-01T00:00:00Z',
          blocked_by: null
        }
      ]

      const mockProfiles = [null] // Malformed profile data
      const mockPresence = []

      const mockFriendshipsQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockResolvedValue({ data: mockFriendships, error: null }),
      }

      const mockProfilesQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      }

      const mockPresenceQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: mockPresence, error: null }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockFriendshipsQuery) // friendships query
        .mockReturnValueOnce(mockProfilesQuery)    // profiles query
        .mockReturnValueOnce(mockPresenceQuery)    // presence query

      const result = await friendsService.getFriends('user-id')
      
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      // Should handle missing profile gracefully
      expect(result[0].id).toBe('friend-1')
    })
  })

  describe('getFriendInvitations', () => {
    it('returns empty array when no invitations exist', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await friendsService.getFriendInvitations('user-id')
      
      expect(result).toEqual([])
    })

    it('handles database errors in invitations fetch', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(friendsService.getFriendInvitations('user-id'))
        .rejects.toThrow('Failed to fetch invitations: DB Error')
    })

    it('handles malformed invitation data gracefully', async () => {
      const malformedInvitations = [
        {
          id: 'invitation-1',
          inviter_id: 'inviter-1',
          // Missing some required fields
        },
        null, // Completely invalid
      ]

      const mockInvitationsQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: malformedInvitations, error: null }),
      }

      const mockProfilesQuery = {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockInvitationsQuery)
        .mockReturnValueOnce(mockProfilesQuery)

      const result = await friendsService.getFriendInvitations('user-id')
      
      expect(Array.isArray(result)).toBe(true)
      // Should handle malformed data without crashing
      expect(result.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('searchUsers', () => {
    it('returns empty array when no users found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await friendsService.searchUsers('nonexistent')
      
      expect(result).toEqual([])
    })

    it('handles search errors gracefully', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Search failed') }),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(friendsService.searchUsers('test'))
        .rejects.toThrow('Search failed: Search failed')
    })

    it('ensures array return type even for null data', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await friendsService.searchUsers('test')
      
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual([])
    })
  })

  describe('sendFriendInvitation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      })
    })

    it('validates email format', async () => {
      await expect(friendsService.sendFriendInvitation({
        inviteeEmail: 'invalid-email'
      })).rejects.toThrow('Please enter a valid email address')
    })

    it('validates phone format', async () => {
      await expect(friendsService.sendFriendInvitation({
        inviteePhone: 'invalid-phone'
      })).rejects.toThrow('Please enter a valid phone number')
    })

    it('requires at least one contact method', async () => {
      await expect(friendsService.sendFriendInvitation({}))
        .rejects.toThrow('Please provide an email, phone number, or select a user to invite.')
    })

    it('handles database errors during invitation creation', async () => {
      const mockProfileQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Insert failed') 
        }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockProfileQuery)
        .mockReturnValueOnce(mockInsertQuery)

      await expect(friendsService.sendFriendInvitation({
        inviteeEmail: 'valid@example.com'
      })).rejects.toThrow()
    })

    it('continues even when notification fails', async () => {
      const mockProfileQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { full_name: 'Test User' }, 
          error: null 
        }),
      }

      const mockInsertQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: {
            id: 'invitation-1',
            status: 'pending'
          }, 
          error: null 
        }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockProfileQuery)
        .mockReturnValueOnce(mockInsertQuery)

      // Mock notification failure
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Notification failed'))

      const result = await friendsService.sendFriendInvitation({
        inviteeEmail: 'valid@example.com'
      })

      expect(result.id).toBe('invitation-1')
      expect(result.status).toBe('pending')
    })
  })

  describe('respondToInvitation', () => {
    it('handles response errors gracefully', async () => {
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Update failed') 
        }),
      }

      mockSupabase.from.mockReturnValue(mockUpdateQuery)

      await expect(friendsService.respondToInvitation('invitation-1', 'accepted'))
        .rejects.toThrow('Failed to respond to invitation: Update failed')
    })

    it('creates friendships when invitation is accepted', async () => {
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      const mockSelectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { 
            inviter_id: 'inviter-1', 
            invitee_id: 'invitee-1' 
          }, 
          error: null 
        }),
      }

      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockUpdateQuery)   // Update invitation
        .mockReturnValueOnce(mockSelectQuery)   // Get invitation details
        .mockReturnValueOnce(mockInsertQuery)   // Create friendship 1
        .mockReturnValueOnce(mockInsertQuery)   // Create friendship 2

      await expect(friendsService.respondToInvitation('invitation-1', 'accepted'))
        .resolves.not.toThrow()
    })

    it('handles friendship creation failures gracefully', async () => {
      const mockUpdateQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }

      const mockSelectQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { 
            inviter_id: 'inviter-1', 
            invitee_id: 'invitee-1' 
          }, 
          error: null 
        }),
      }

      const mockInsertQuery = {
        insert: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Friendship creation failed') 
        }),
      }

      mockSupabase.from
        .mockReturnValueOnce(mockUpdateQuery)
        .mockReturnValueOnce(mockSelectQuery)
        .mockReturnValueOnce(mockInsertQuery)

      await expect(friendsService.respondToInvitation('invitation-1', 'accepted'))
        .rejects.toThrow('Failed to create friendship records')
    })
  })

  describe('updateUserPresence', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user' } },
        error: null
      })
    })

    it('handles upsert errors gracefully', async () => {
      const mockUpsertQuery = {
        upsert: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Upsert failed') 
        }),
      }

      mockSupabase.from.mockReturnValue(mockUpsertQuery)

      await expect(friendsService.updateUserPresence('online'))
        .rejects.toThrow('Failed to update presence: Upsert failed')
    })

    it('requires authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      await expect(friendsService.updateUserPresence('online'))
        .rejects.toThrow('User not authenticated')
    })
  })

  describe('getUserPresence', () => {
    it('returns null when no presence data exists', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } // No rows found
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await friendsService.getUserPresence('user-id')
      
      expect(result).toBeNull()
    })

    it('handles database errors appropriately', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Database error') 
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await expect(friendsService.getUserPresence('user-id'))
        .rejects.toThrow('Failed to fetch presence: Database error')
    })
  })
})