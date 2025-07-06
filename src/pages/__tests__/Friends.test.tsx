import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import Friends from '@/pages/Friends'
import { mockUser, mockFriend, mockInvitation, mockApiError } from '@/test-utils'

// Mock the hooks
vi.mock('@/hooks/useFriendsData', () => ({
  useFriendsData: vi.fn(),
}))

vi.mock('@/hooks/useFriendsFiltering', () => ({
  useFriendsFiltering: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

import { useFriendsData } from '@/hooks/useFriendsData'
import { useFriendsFiltering } from '@/hooks/useFriendsFiltering'

const mockUseFriendsData = useFriendsData as any
const mockUseFriendsFiltering = useFriendsFiltering as any

describe('Friends Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock implementations
    mockUseFriendsData.mockReturnValue({
      friends: [],
      friendsLoading: false,
      friendsError: null,
      invitations: [],
      invitationsLoading: false,
      invitationsError: null,
      handleRefetchFriends: vi.fn(),
      handleRefetchInvitations: vi.fn(),
    })
    
    mockUseFriendsFiltering.mockReturnValue({
      searchQuery: '',
      setSearchQuery: vi.fn(),
      filteredFriends: [],
    })
  })

  describe('Loading States', () => {
    it('shows loading state when friends are loading', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: true,
        friendsError: null,
        invitations: [],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })

      render(<Friends />)
      
      expect(screen.getByText('Loading your friends...')).toBeInTheDocument()
    })

    it('shows loading state when invitations are loading', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: false,
        friendsError: null,
        invitations: [],
        invitationsLoading: true,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })

      render(<Friends />)
      
      expect(screen.getByText('Loading your friends...')).toBeInTheDocument()
    })
  })

  describe('Error States', () => {
    it('shows error UI when friends loading fails', async () => {
      const mockRefetchFriends = vi.fn()
      const mockRefetchInvitations = vi.fn()
      
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: false,
        friendsError: mockApiError,
        invitations: [],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: mockRefetchFriends,
        handleRefetchInvitations: mockRefetchInvitations,
      })

      render(<Friends />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('API request failed')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      
      // Test retry functionality
      const tryAgainButton = screen.getByText('Try Again')
      await userEvent.click(tryAgainButton)
      
      expect(mockRefetchFriends).toHaveBeenCalled()
      expect(mockRefetchInvitations).toHaveBeenCalled()
    })

    it('shows error UI when invitations loading fails', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: false,
        friendsError: null,
        invitations: [],
        invitationsLoading: false,
        invitationsError: mockApiError,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })

      render(<Friends />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('API request failed')).toBeInTheDocument()
    })

    it('shows error UI when both friends and invitations fail', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: false,
        friendsError: mockApiError,
        invitations: [],
        invitationsLoading: false,
        invitationsError: new Error('Invitations failed'),
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })

      render(<Friends />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      // Should show the first error message
      expect(screen.getByText('API request failed')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('renders successfully with no friends and no invitations', () => {
      render(<Friends />)
      
      expect(screen.getByText('Friends')).toBeInTheDocument()
      expect(screen.getByText('0 friends • 0 online')).toBeInTheDocument()
      expect(screen.getByText('Invitations')).toBeInTheDocument()
    })

    it('shows correct friend count when friends exist', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [mockFriend],
        friendsLoading: false,
        friendsError: null,
        invitations: [],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })
      
      mockUseFriendsFiltering.mockReturnValue({
        searchQuery: '',
        setSearchQuery: vi.fn(),
        filteredFriends: [mockFriend],
      })

      render(<Friends />)
      
      expect(screen.getByText('1 friends • 1 online')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('displays friend and invitation badges correctly', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [mockFriend],
        friendsLoading: false,
        friendsError: null,
        invitations: [mockInvitation],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })
      
      mockUseFriendsFiltering.mockReturnValue({
        searchQuery: '',
        setSearchQuery: vi.fn(),
        filteredFriends: [mockFriend],
      })

      render(<Friends />)
      
      // Should show friend count badge
      expect(screen.getByText('1')).toBeInTheDocument()
      
      // Should show invitation count badge
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    it('catches errors from child components', () => {
      // Mock console.error to avoid test output noise
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Make useFriendsData throw an error
      mockUseFriendsData.mockImplementation(() => {
        throw new Error('Unexpected error in hook')
      })

      render(<Friends />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })
  })

  describe('Defensive Data Handling', () => {
    it('handles null friends data gracefully', () => {
      mockUseFriendsData.mockReturnValue({
        friends: null, // This should be handled defensively
        friendsLoading: false,
        friendsError: null,
        invitations: [],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })
      
      mockUseFriendsFiltering.mockReturnValue({
        searchQuery: '',
        setSearchQuery: vi.fn(),
        filteredFriends: null, // This should also be handled
      })

      render(<Friends />)
      
      // Should not crash and show 0 friends
      expect(screen.getByText('0 friends • 0 online')).toBeInTheDocument()
    })

    it('handles undefined invitations data gracefully', () => {
      mockUseFriendsData.mockReturnValue({
        friends: [],
        friendsLoading: false,
        friendsError: null,
        invitations: undefined, // This should be handled defensively
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })

      render(<Friends />)
      
      // Should not crash
      expect(screen.getByText('Friends')).toBeInTheDocument()
    })

    it('handles malformed friend data gracefully', () => {
      const malformedFriend = {
        id: 'malformed-friend',
        // Missing required fields
      }
      
      mockUseFriendsData.mockReturnValue({
        friends: [malformedFriend],
        friendsLoading: false,
        friendsError: null,
        invitations: [],
        invitationsLoading: false,
        invitationsError: null,
        handleRefetchFriends: vi.fn(),
        handleRefetchInvitations: vi.fn(),
      })
      
      mockUseFriendsFiltering.mockReturnValue({
        searchQuery: '',
        setSearchQuery: vi.fn(),
        filteredFriends: [malformedFriend],
      })

      render(<Friends />)
      
      // Should not crash
      expect(screen.getByText('Friends')).toBeInTheDocument()
    })
  })
})