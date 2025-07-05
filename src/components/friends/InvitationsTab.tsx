import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { InvitationsLoadingFallback } from '@/components/LoadingFallback';
import FriendInvitations from '@/components/FriendInvitations';
import type { FriendInvitationWithProfile } from '@/types/database';

interface InvitationsTabProps {
  invitations: FriendInvitationWithProfile[];
  invitationsError: Error | null;  
  onRetry: () => void;
  onInvitationUpdated: () => void;
}

const InvitationsTab = ({
  invitations,
  invitationsError,
  onRetry,
  onInvitationUpdated
}: InvitationsTabProps) => {
  return (
    <ErrorBoundary>
      {invitationsError ? (
        <InvitationsLoadingFallback 
          error={invitationsError} 
          onRetry={onRetry}
        />
      ) : (
        <FriendInvitations 
          invitations={invitations} 
          onInvitationUpdated={onInvitationUpdated}
        />
      )}
    </ErrorBoundary>
  );
};

export default InvitationsTab;