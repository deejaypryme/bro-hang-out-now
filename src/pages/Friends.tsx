import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Bell } from 'lucide-react';
import Header from '@/components/Header';
import FriendProfile from '@/components/FriendProfile';
import ErrorBoundary from '@/components/ErrorBoundary';
import { FriendsLoadingFallback } from '@/components/LoadingFallback';
import FriendsHeader from '@/components/friends/FriendsHeader';
import FriendsTab from '@/components/friends/FriendsTab';
import InvitationsTab from '@/components/friends/InvitationsTab';
import { useFriendsData } from '@/hooks/useFriendsData';
import { useFriendsFiltering } from '@/hooks/useFriendsFiltering';
import { categorizeFriends } from '@/utils/friendsUtils';
import type { FriendWithProfile } from '@/types/database';

const FriendsContent = () => {
  const {
    friends,
    friendsLoading,
    friendsError,
    invitations,
    invitationsLoading,
    invitationsError,
    handleRefetchFriends,
    handleRefetchInvitations
  } = useFriendsData();

  const { searchQuery, setSearchQuery, filteredFriends } = useFriendsFiltering(friends);
  
  const [selectedFriend, setSelectedFriend] = useState<FriendWithProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleFriendClick = useCallback((friend: FriendWithProfile) => {
    setSelectedFriend(friend);
    setProfileOpen(true);
  }, []);

  const handleInvitationUpdated = useCallback(() => {
    handleRefetchInvitations();
    handleRefetchFriends();
  }, [handleRefetchInvitations, handleRefetchFriends]);

  const userStats = {
    broPoints: 485,
    currentStreak: 3,
    totalHangouts: 12,
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const { favoriteFriends, onlineFriends } = categorizeFriends(filteredFriends);
  const onlineFriendsCount = onlineFriends.length + favoriteFriends.filter(f => f.status === 'online').length;

  // Show loading fallback for initial load
  if (friendsLoading || invitationsLoading) {
    return (
      <div className="min-h-screen hero-background">
        <Header userStats={userStats} />
        <main className="max-w-4xl mx-auto py-bro-2xl px-bro-lg">
          <FriendsLoadingFallback isLoading={true} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      <main className="max-w-4xl mx-auto py-bro-2xl px-bro-lg space-y-bro-2xl">
        <FriendsHeader 
          friends={friends}
          onlineFriendsCount={onlineFriendsCount}
          onFriendAdded={handleRefetchInvitations}
        />

        <Card variant="glass" className="shadow-2xl border-white/20">
          <CardContent className="pt-bro-lg">
            <Tabs defaultValue="friends" className="space-y-bro-xl">
              <TabsList className="grid w-full grid-cols-2 glass-surface rounded-bro-lg border border-white/20">
                <TabsTrigger value="friends" className="flex items-center gap-bro-sm text-primary-navy data-[state=active]:bg-accent-orange data-[state=active]:text-white">
                  <Users className="w-4 h-4" />
                  Friends
                  {friends.length > 0 && (
                    <Badge variant="secondary" className="ml-bro-xs bg-white/20 text-primary-navy">
                      {friends.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center gap-bro-sm text-primary-navy data-[state=active]:bg-accent-orange data-[state=active]:text-white">
                  <Bell className="w-4 h-4" />
                  Invitations
                  {pendingInvitations.length > 0 && (
                    <Badge variant="destructive" className="ml-bro-xs">
                      {pendingInvitations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="friends" className="space-y-bro-xl">
                <FriendsTab
                  friends={friends}
                  filteredFriends={filteredFriends}
                  friendsError={friendsError}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFriendClick={handleFriendClick}
                  onRetry={handleRefetchFriends}
                  onFriendAdded={handleRefetchInvitations}
                />
              </TabsContent>

              <TabsContent value="invitations">
                <InvitationsTab
                  invitations={invitations}
                  invitationsError={invitationsError}
                  onRetry={handleRefetchInvitations}
                  onInvitationUpdated={handleInvitationUpdated}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <FriendProfile
          friend={selectedFriend}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          onFriendUpdated={handleRefetchFriends}
        />
      </main>
    </div>
  );
};

const Friends = () => {
  return (
    <ErrorBoundary>
      <FriendsContent />
    </ErrorBoundary>
  );
};

export default Friends;