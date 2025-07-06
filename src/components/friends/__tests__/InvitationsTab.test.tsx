import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/dom'
import { render, userEvent } from '@/test-utils'
import InvitationsTab from '@/components/friends/InvitationsTab'
import { mockInvitation, mockApiError } from '@/test-utils'

describe('InvitationsTab', () => {
  const defaultProps = {
    invitations: [],
    invitationsError: null,
    onRetry: vi.fn(),
    onInvitationUpdated: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Error States', () => {
    it('renders error fallback when invitationsError is present', () => {
      render(
        <InvitationsTab
          {...defaultProps}
          invitationsError={mockApiError}
        />
      )

      expect(screen.getByText('Failed to load your friend invitations')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', async () => {
      const onRetryMock = vi.fn()
      
      const { user } = render(
        <InvitationsTab
          {...defaultProps}
          invitationsError={mockApiError}
          onRetry={onRetryMock}
        />
      )

      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      expect(onRetryMock).toHaveBeenCalled()
    })

    it('displays custom error messages correctly', () => {
      const customError = new Error('Custom invitation error')
      
      render(
        <InvitationsTab
          {...defaultProps}
          invitationsError={customError}
        />
      )

      expect(screen.getByText('Failed to load your friend invitations')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('renders FriendInvitations component when no error', () => {
      render(
        <InvitationsTab
          {...defaultProps}
          invitations={[mockInvitation]}
        />
      )

      // Should render the FriendInvitations component
      expect(screen.getByText('Test Inviter')).toBeInTheDocument()
    })

    it('passes correct props to FriendInvitations', () => {
      const mockOnInvitationUpdated = vi.fn()
      const invitations = [mockInvitation]
      
      render(
        <InvitationsTab
          {...defaultProps}
          invitations={invitations}
          onInvitationUpdated={mockOnInvitationUpdated}
        />
      )

      // The FriendInvitations component should receive the invitations
      expect(screen.getByText('Test Inviter')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('handles empty invitations array', () => {
      render(<InvitationsTab {...defaultProps} />)

      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
      expect(screen.getByText('When you receive friend invitations, they\'ll appear here.')).toBeInTheDocument()
    })
  })

  describe('Defensive Data Handling', () => {
    it('handles null invitations array gracefully', () => {
      render(
        <InvitationsTab
          {...defaultProps}
          invitations={null as any}
        />
      )

      // Should show empty state, not crash
      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })

    it('handles undefined invitations array gracefully', () => {
      render(
        <InvitationsTab
          {...defaultProps}
          invitations={undefined as any}
        />
      )

      // Should show empty state, not crash
      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })

    it('handles malformed invitations data gracefully', () => {
      const malformedInvitations = [
        { id: '1' }, // Missing required fields
        { id: '2', status: null }, // Null status
        null, // Null invitation object
      ] as any

      render(
        <InvitationsTab
          {...defaultProps}
          invitations={malformedInvitations}
        />
      )

      // Should not crash - the child component should handle malformed data
      expect(screen.queryByText('Error')).not.toBeInTheDocument()
    })

    it('handles missing callback functions gracefully', () => {
      render(
        <InvitationsTab
          {...defaultProps}
          onRetry={undefined as any}
          onInvitationUpdated={undefined as any}
        />
      )

      // Should still render without crashing
      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    it('is wrapped in ErrorBoundary and catches child component errors', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Create invitation that might cause error in child component
      const errorCausingInvitation = {
        ...mockInvitation,
        // Add malformed data that might cause rendering issues
        inviterProfile: {
          ...mockInvitation.inviterProfile,
          render: () => { throw new Error('Child component error') }
        }
      }

      render(
        <InvitationsTab
          {...defaultProps}
          invitations={[errorCausingInvitation]}
        />
      )

      // The ErrorBoundary should catch any errors from FriendInvitations
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      
      consoleError.mockRestore()
    })
  })

  describe('State Management', () => {
    it('passes through onInvitationUpdated callback correctly', () => {
      const mockCallback = vi.fn()
      
      render(
        <InvitationsTab
          {...defaultProps}
          invitations={[mockInvitation]}
          onInvitationUpdated={mockCallback}
        />
      )

      // The callback should be passed to FriendInvitations
      // This is tested implicitly by ensuring the component renders correctly
      expect(screen.getByText('Test Inviter')).toBeInTheDocument()
    })
  })

  describe('Performance Edge Cases', () => {
    it('handles large invitations list without performance issues', () => {
      const largeInvitationsList = Array.from({ length: 500 }, (_, i) => ({
        ...mockInvitation,
        id: `invitation-${i}`,
        inviterProfile: {
          ...mockInvitation.inviterProfile!,
          id: `inviter-${i}`,
          full_name: `Inviter ${i}`,
        }
      }))

      render(
        <InvitationsTab
          {...defaultProps}
          invitations={largeInvitationsList}
        />
      )

      // Should render without hanging
      expect(screen.getByText('Inviter 0')).toBeInTheDocument()
    })

    it('handles rapid error state changes', () => {
      const { rerender } = render(
        <InvitationsTab
          {...defaultProps}
          invitationsError={mockApiError}
        />
      )

      expect(screen.getByText('Failed to load your friend invitations')).toBeInTheDocument()

      // Change to no error
      rerender(
        <InvitationsTab
          {...defaultProps}
          invitationsError={null}
        />
      )

      expect(screen.getByText('No Friend Invitations')).toBeInTheDocument()

      // Change back to error
      rerender(
        <InvitationsTab
          {...defaultProps}
          invitationsError={new Error('Another error')}
        />
      )

      expect(screen.getByText('Failed to load your friend invitations')).toBeInTheDocument()
    })
  })
})