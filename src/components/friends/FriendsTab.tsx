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
              <Card variant="glass" className="shadow-xl border-white/20 text-center py-bro-4xl">
                <CardContent>
                  <div className="text-8xl mb-bro-lg animate-pulse">👥</div>
                  <h3 className="typo-headline-md text-primary-navy mb-bro-md">Your Squad Awaits</h3>
                  <p className="typo-body text-text-secondary mb-bro-xl max-w-md mx-auto">
                    Start building your network by adding friends. Once you connect, you can easily coordinate hangouts!
                  </p>
                  <AddFriendModal onFriendAdded={onFriendAdded} />
                  <div className="mt-bro-xl pt-bro-xl border-t border-white/20 max-w-md mx-auto">
                    <p className="typo-mono text-text-muted text-sm">
                      💡 Tip: You can add friends by email, phone, or username
                    </p>
                  </div>
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