import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import FriendInvitations from '@/components/FriendInvitations'
import { mockUser, mockInvitation } from '@/test-utils'

// Mock the friendsService
vi.mock('@/services/friendsService', () => ({
  friendsService: {
    respondToInvitation: vi.fn(),
  },
}))

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

import { friendsService } from '@/services/friendsService'

describe('FriendInvitations', () => {
  const defaultProps = {
    invitations: [],
    onInvitationUpdated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Empty States', () => {
    it('shows empty state when no invitations', () => {
      render(<FriendInvitations {...defaultProps} />)

      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
      expect(screen.getByText('When you receive friend invitations, they\'ll appear here.')).toBeInTheDocument()
    })

    it('shows empty state icon', () => {
      render(<FriendInvitations {...defaultProps} />)

      // Clock icon should be present for empty state
      const clockIcon = screen.getByTestId('clock-icon') || screen.getByText('No Friend Invitations').parentElement?.querySelector('svg')
      expect(clockIcon).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('displays received invitations correctly', () => {
      const receivedInvitation = {
        ...mockInvitation,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[receivedInvitation]}
        />
      )

      expect(screen.getByText('Received Invitations')).toBeInTheDocument()
      expect(screen.getByText('Test Inviter')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    it('displays sent invitations correctly', () => {
      const sentInvitation = {
        ...mockInvitation,
        inviter_id: mockUser.id,
        invitee_id: 'other-user',
        invitee_email: 'invitee@example.com',
      }

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[sentInvitation]}
        />
      )

      expect(screen.getByText('Sent Invitations')).toBeInTheDocument()
      expect(screen.getByText('invitee@example.com')).toBeInTheDocument()
      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    it('displays invitation message when present', () => {
      const invitationWithMessage = {
        ...mockInvitation,
        message: 'Let\'s connect!',
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[invitationWithMessage]}
        />
      )

      expect(screen.getByText('"Let\'s connect!"')).toBeInTheDocument()
    })

    it('shows different invitation types correctly', () => {
      const emailInvitation = {
        ...mockInvitation,
        invitee_email: 'test@example.com',
        invitee_phone: null,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      const phoneInvitation = {
        ...mockInvitation,
        id: 'invitation-2',
        invitee_email: null,
        invitee_phone: '+1234567890',
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[emailInvitation, phoneInvitation]}
        />
      )

      expect(screen.getByText('via email')).toBeInTheDocument()
      expect(screen.getByText('via phone')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles invitation acceptance', async () => {
      const mockRespondToInvitation = vi.fn().mockResolvedValue(undefined)
      const mockOnInvitationUpdated = vi.fn()
      
      vi.mocked(friendsService.respondToInvitation).mockImplementation(mockRespondToInvitation)

      const pendingInvitation = {
        ...mockInvitation,
        status: 'pending' as const,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      const { user } = render(
        <FriendInvitations
          {...defaultProps}
          invitations={[pendingInvitation]}
          onInvitationUpdated={mockOnInvitationUpdated}
        />
      )

      const acceptButton = screen.getByRole('button', { name: /accept|✓/i })
      await user.click(acceptButton)

      await waitFor(() => {
        expect(mockRespondToInvitation).toHaveBeenCalledWith('invitation-1', 'accepted')
        expect(mockOnInvitationUpdated).toHaveBeenCalled()
      })
    })

    it('handles invitation decline', async () => {
      const mockRespondToInvitation = vi.fn().mockResolvedValue(undefined)
      const mockOnInvitationUpdated = vi.fn()
      
      vi.mocked(friendsService.respondToInvitation).mockImplementation(mockRespondToInvitation)

      const pendingInvitation = {
        ...mockInvitation,
        status: 'pending' as const,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      const { user } = render(
        <FriendInvitations
          {...defaultProps}
          invitations={[pendingInvitation]}
          onInvitationUpdated={mockOnInvitationUpdated}
        />
      )

      const declineButton = screen.getByRole('button', { name: /decline|✗|×/i })
      await user.click(declineButton)

      await waitFor(() => {
        expect(mockRespondToInvitation).toHaveBeenCalledWith('invitation-1', 'declined')
        expect(mockOnInvitationUpdated).toHaveBeenCalled()
      })
    })

    it('disables buttons during response processing', async () => {
      const mockRespondToInvitation = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )
      
      vi.mocked(friendsService.respondToInvitation).mockImplementation(mockRespondToInvitation)

      const pendingInvitation = {
        ...mockInvitation,
        status: 'pending' as const,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      const { user } = render(
        <FriendInvitations
          {...defaultProps}
          invitations={[pendingInvitation]}
        />
      )

      const acceptButton = screen.getByRole('button', { name: /accept|✓/i })
      await user.click(acceptButton)

      // Buttons should be disabled during processing
      expect(acceptButton).toBeDisabled()
      expect(screen.getByRole('button', { name: /decline|✗|×/i })).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('handles invitation response errors gracefully', async () => {
      const mockRespondToInvitation = vi.fn().mockRejectedValue(new Error('Response failed'))
      vi.mocked(friendsService.respondToInvitation).mockImplementation(mockRespondToInvitation)

      const pendingInvitation = {
        ...mockInvitation,
        status: 'pending' as const,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      const { user } = render(
        <FriendInvitations
          {...defaultProps}
          invitations={[pendingInvitation]}
        />
      )

      const acceptButton = screen.getByRole('button', { name: /accept|✓/i })
      await user.click(acceptButton)

      await waitFor(() => {
        expect(mockRespondToInvitation).toHaveBeenCalled()
        // Toast should be called with error (mocked, so we can't test the actual toast)
      })

      // Buttons should be re-enabled after error
      expect(acceptButton).not.toBeDisabled()
    })
  })

  describe('Defensive Data Handling', () => {
    it('handles null invitations array gracefully', () => {
      render(
        <FriendInvitations
          {...defaultProps}
          invitations={null as any}
        />
      )

      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })

    it('handles undefined invitations array gracefully', () => {
      render(
        <FriendInvitations
          {...defaultProps}
          invitations={undefined as any}
        />
      )

      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })

    it('handles malformed invitation data gracefully', () => {
      const malformedInvitations = [
        { id: '1' }, // Missing required fields
        { id: '2', status: null }, // Null status
        {
          ...mockInvitation,
          inviterProfile: null, // Null profile
        },
        null, // Null invitation
      ] as any

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={malformedInvitations}
        />
      )

      // Should not crash
      expect(screen.queryByText('No Friend Invitations')).not.toBeInTheDocument()
      // Should show some content based on valid invitations
    })

    it('handles missing user gracefully', () => {
      // Mock useAuth to return no user
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({ user: null }),
      }))

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[mockInvitation]}
        />
      )

      // Should not crash even without authenticated user
      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })

    it('handles missing callback functions gracefully', () => {
      render(
        <FriendInvitations
          invitations={[mockInvitation]}
          onInvitationUpdated={undefined as any}
        />
      )

      // Should still render without crashing
      expect(screen.getByText('Test Inviter')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('shows different status badges correctly', () => {
      const invitations = [
        { ...mockInvitation, id: '1', status: 'pending' as const },
        { ...mockInvitation, id: '2', status: 'accepted' as const },
        { ...mockInvitation, id: '3', status: 'declined' as const },
        { ...mockInvitation, id: '4', status: 'expired' as const },
      ]

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={invitations}
        />
      )

      expect(screen.getByText('pending')).toBeInTheDocument()
      expect(screen.getByText('accepted')).toBeInTheDocument()
      expect(screen.getByText('declined')).toBeInTheDocument()
      expect(screen.getByText('expired')).toBeInTheDocument()
    })

    it('only shows action buttons for pending invitations', () => {
      const acceptedInvitation = {
        ...mockInvitation,
        status: 'accepted' as const,
        inviter_id: 'other-user',
        invitee_id: mockUser.id,
      }

      render(
        <FriendInvitations
          {...defaultProps}
          invitations={[acceptedInvitation]}
        />
      )

      // Should not show accept/decline buttons for accepted invitations
      expect(screen.queryByRole('button', { name: /accept|✓/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /decline|✗|×/i })).not.toBeInTheDocument()
    })
  })
})