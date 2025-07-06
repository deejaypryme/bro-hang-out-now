import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/dom'
import { render, userEvent } from '@/test-utils'
import FriendsTab from '@/components/friends/FriendsTab'
import { mockFriend, mockApiError } from '@/test-utils'

describe('FriendsTab', () => {
  const defaultProps = {
    friends: [],
    filteredFriends: [],
    friendsError: null,
    searchQuery: '',
    onSearchChange: vi.fn(),
    onFriendClick: vi.fn(),
    onRetry: vi.fn(),
    onFriendAdded: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Error States', () => {
    it('renders error fallback when friendsError is present', () => {
      render(
        <FriendsTab
          {...defaultProps}
          friendsError={mockApiError}
        />
      )

      expect(screen.getByText('Failed to load your friends')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const onRetryMock = vi.fn()
      
      const { user } = render(
        <FriendsTab
          {...defaultProps}
          friendsError={mockApiError}
          onRetry={onRetryMock}
        />
      )

      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      expect(onRetryMock).toHaveBeenCalled()
    })
  })

  describe('Empty States', () => {
    it('shows "No Friends Yet" message when friends array is empty', () => {
      render(<FriendsTab {...defaultProps} />)

      expect(screen.getByText('No Friends Yet')).toBeInTheDocument()
      expect(screen.getByText('Start building your network by adding friends!')).toBeInTheDocument()
      expect(screen.getByText('Add Friend')).toBeInTheDocument()
    })

    it('renders search input even when no friends', () => {
      render(<FriendsTab {...defaultProps} />)

      expect(screen.getByPlaceholderText('Search friends...')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('renders friends list when friends exist', () => {
      render(
        <FriendsTab
          {...defaultProps}
          friends={[mockFriend]}
          filteredFriends={[mockFriend]}
        />
      )

      expect(screen.getByText('Test Friend')).toBeInTheDocument()
      expect(screen.queryByText('No Friends Yet')).not.toBeInTheDocument()
    })

    it('calls onFriendClick when friend is clicked', async () => {
      const onFriendClickMock = vi.fn()
      
      const { user } = render(
        <FriendsTab
          {...defaultProps}
          friends={[mockFriend]}
          filteredFriends={[mockFriend]}
          onFriendClick={onFriendClickMock}
        />
      )

      const friendCard = screen.getByText('Test Friend')
      await user.click(friendCard)

      expect(onFriendClickMock).toHaveBeenCalledWith(mockFriend)
    })
  })

  describe('Search Functionality', () => {
    it('calls onSearchChange when search input changes', async () => {
      const onSearchChangeMock = vi.fn()
      
      const { user } = render(
        <FriendsTab
          {...defaultProps}
          onSearchChange={onSearchChangeMock}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search friends...')
      await user.type(searchInput, 'test')

      expect(onSearchChangeMock).toHaveBeenCalledWith('test')
    })

    it('displays current search query in input', () => {
      render(
        <FriendsTab
          {...defaultProps}
          searchQuery="current search"
        />
      )

      const searchInput = screen.getByDisplayValue('current search')
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('Defensive Data Handling', () => {
    it('handles null friends array gracefully', () => {
      render(
        <FriendsTab
          {...defaultProps}
          friends={null as any}
          filteredFriends={null as any}
        />
      )

      // Should show empty state, not crash
      expect(screen.getByText('No Friends Yet')).toBeInTheDocument()
    })

    it('handles undefined friends array gracefully', () => {
      render(
        <FriendsTab
          {...defaultProps}
          friends={undefined as any}
          filteredFriends={undefined as any}
        />
      )

      // Should show empty state, not crash
      expect(screen.getByText('No Friends Yet')).toBeInTheDocument()
    })

    it('handles malformed friends data gracefully', () => {
      const malformedFriends = [
        { id: '1' }, // Missing required fields
        { id: '2', full_name: null }, // Null name
        null, // Null friend object
      ] as any

      render(
        <FriendsTab
          {...defaultProps}
          friends={malformedFriends}
          filteredFriends={malformedFriends}
        />
      )

      // Should not crash
      expect(screen.getByText('Search friends...')).toBeInTheDocument()
    })

    it('handles missing callback functions gracefully', () => {
      render(
        <FriendsTab
          {...defaultProps}
          onSearchChange={undefined as any}
          onFriendClick={undefined as any}
          onRetry={undefined as any}
        />
      )

      // Should still render without crashing
      expect(screen.getByText('No Friends Yet')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    it('is wrapped in ErrorBoundary and catches child component errors', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock a friend that will cause an error in child component
      const errorCausingFriend = {
        ...mockFriend,
        // Add property that might cause rendering error
        malformedData: () => { throw new Error('Child component error') }
      }

      render(
        <FriendsTab
          {...defaultProps}
          friends={[errorCausingFriend]}
          filteredFriends={[errorCausingFriend]}
        />
      )

      // The ErrorBoundary should catch any errors from child components
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })
  })

  describe('Performance Edge Cases', () => {
    it('handles large friends list without performance issues', () => {
      const largeFriendsList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockFriend,
        id: `friend-${i}`,
        full_name: `Friend ${i}`,
      }))

      render(
        <FriendsTab
          {...defaultProps}
          friends={largeFriendsList}
          filteredFriends={largeFriendsList}
        />
      )

      // Should render without hanging
      expect(screen.getByText('Search friends...')).toBeInTheDocument()
    })
  })
})