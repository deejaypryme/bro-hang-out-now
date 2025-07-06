import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FriendsLoadingFallback } from '@/components/LoadingFallback';
import AddFriendModal from '@/components/AddFriendModal';
import FriendsSearch from './FriendsSearch';
import FriendsList from './FriendsList';
import { categorizeFriends } from '@/utils/friendsUtils';
import type { FriendWithProfile } from '@/types/database';

interface FriendsTabProps {
  friends: FriendWithProfile[];
  filteredFriends: FriendWithProfile[];
  friendsError: Error | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFriendClick: (friend: FriendWithProfile) => void;
  onRetry: () => void;
  onFriendAdded: () => void;
}

const FriendsTab = ({
  friends = [],
  filteredFriends = [],
  friendsError,
  searchQuery = '',
  onSearchChange,
  onFriendClick,
  onRetry,
  onFriendAdded
}: FriendsTabProps) => {
  // Defensive data handling
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeFilteredFriends = Array.isArray(filteredFriends) ? filteredFriends : [];
  
  const { favoriteFriends, onlineFriends, offlineFriends } = categorizeFriends(safeFilteredFriends);

  return (
    <div className="space-y-bro-xl">
      <ErrorBoundary>
        {friendsError ? (
          <FriendsLoadingFallback 
            error={friendsError} 
            onRetry={onRetry}
          />
        ) : (
          <>
            <FriendsSearch 
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />

            {safeFriends.length === 0 ? (
              <Card variant="glass" className="shadow-xl border-white/20">
                <CardContent className="text-center py-bro-4xl">
                  <Users className="w-16 h-16 text-accent-orange mx-auto mb-bro-lg" />
                  <h3 className="typo-title-lg text-primary-navy mb-bro-sm">No Friends Yet</h3>
                  <p className="typo-body text-text-secondary mb-bro-xl">Start building your network by adding friends!</p>
                  <AddFriendModal onFriendAdded={onFriendAdded} />
                </CardContent>
              </Card>
            ) : (
              <FriendsList
                favoriteFriends={favoriteFriends}
                onlineFriends={onlineFriends}
                offlineFriends={offlineFriends}
                onFriendClick={onFriendClick}
              />
            )}
          </>
        )}
      </ErrorBoundary>
    </div>
  );
};

export default FriendsTab;