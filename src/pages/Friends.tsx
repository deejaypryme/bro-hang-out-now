
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, UserPlus, Bell, Star, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends, useFriendInvitations, useUpdateUserPresence } from '@/hooks/useDatabase';
import { friendsService } from '@/services/friendsService';
import Header from '../components/Header';
import AddFriendModal from '../components/AddFriendModal';
import FriendProfile from '../components/FriendProfile';
import FriendInvitations from '../components/FriendInvitations';
import type { FriendWithProfile } from '@/types/database';

const Friends = () => {
  const { user } = useAuth();
  const { data: friends = [], isLoading: friendsLoading, refetch: refetchFriends } = useFriends();
  const { data: invitations = [], isLoading: invitationsLoading, refetch: refetchInvitations } = useFriendInvitations();
  const updatePresence = useUpdateUserPresence();

  const [selectedFriend, setSelectedFriend] = useState<FriendWithProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState(friends);

  // STABLE: Set user presence to online when component mounts, offline when unmounts
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting user presence to online for user:', user.id);
    
    // Set user online when component mounts
    updatePresence.mutate({ status: 'online' });

    // Cleanup: Set user offline when component unmounts
    return () => {
      console.log('🔄 Setting user presence to offline for user:', user.id);
      updatePresence.mutate({ status: 'offline' });
    };
  }, [user?.id]); // STABLE: Only depends on user.id

  // STABLE: Set up real-time subscriptions only once
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time subscriptions for user:', user.id);
    
    // Set up presence subscription
    const presenceChannel = friendsService.subscribeToFriendPresence(user.id, (presence) => {
      console.log('👥 Friend presence updated:', presence);
      // Simple refetch without cascading effects
      setTimeout(() => refetchFriends(), 100);
    });
    
    // Set up invitations subscription
    const invitationsChannel = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
      console.log('📨 Friend invitation updated:', invitation);
      // Simple refetch without cascading effects
      setTimeout(() => refetchInvitations(), 100);
    });

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      presenceChannel.unsubscribe();
      invitationsChannel.unsubscribe();
    };
  }, [user?.id]); // STABLE: Only depends on user.id

  // STABLE: Filter friends based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        friend.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [friends, searchQuery]); // STABLE: Only depends on friends array and searchQuery

  // STABLE: Callback functions that don't change between renders
  const handleFriendClick = useCallback((friend: FriendWithProfile) => {
    setSelectedFriend(friend);
    setProfileOpen(true);
  }, []);

  const handleRefetchFriends = useCallback(() => {
    console.log('🔄 Manually refetching friends...');
    refetchFriends();
  }, [refetchFriends]);

  const handleRefetchInvitations = useCallback(() => {
    console.log('🔄 Manually refetching invitations...');
    refetchInvitations();
  }, [refetchInvitations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (friend: FriendWithProfile) => {
    switch (friend.status) {
      case 'online': return 'Available now';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      default: return `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const favoriteFriends = filteredFriends.filter(friend => friend.favorite);
  const onlineFriends = filteredFriends.filter(friend => friend.status === 'online' && !friend.favorite);
  const offlineFriends = filteredFriends.filter(friend => friend.status !== 'online' && !friend.favorite);

  const userStats = {
    broPoints: 485,
    currentStreak: 3,
    totalHangouts: 12,
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (friendsLoading || invitationsLoading) {
    return (
      <div className="min-h-screen hero-background">
        <Header userStats={userStats} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-2xl text-white mx-auto mb-bro-lg animate-pulse shadow-lg">
              👊
            </div>
            <p className="typo-body text-white/80">Loading your friends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-background">
      <Header userStats={userStats} />
      
      <main className="max-w-4xl mx-auto py-bro-2xl px-bro-lg space-y-bro-2xl">
        <div className="flex items-center justify-between mb-bro-2xl">
          <div>
            <h1 className="typo-headline-lg text-white mb-bro-sm">Friends</h1>
            <p className="typo-body text-white/80">
              {friends.length} friends • {onlineFriends.length + filteredFriends.filter(f => f.favorite && f.status === 'online').length} online
            </p>
          </div>
          <AddFriendModal onFriendAdded={handleRefetchInvitations} />
        </div>

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
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-bro-md top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                  <Input
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 glass-surface border-white/20 focus:border-accent-orange focus:ring-accent-orange/20 text-primary-navy placeholder:text-text-secondary"
                  />
                </div>

                {friends.length === 0 ? (
                  <Card variant="glass" className="shadow-xl border-white/20">
                    <CardContent className="text-center py-bro-4xl">
                      <Users className="w-16 h-16 text-accent-orange mx-auto mb-bro-lg" />
                      <h3 className="typo-title-lg text-primary-navy mb-bro-sm">No Friends Yet</h3>
                      <p className="typo-body text-text-secondary mb-bro-xl">Start building your network by adding friends!</p>
                      <AddFriendModal onFriendAdded={handleRefetchInvitations} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-bro-xl">
                    {/* Favorite Friends */}
                    {favoriteFriends.length > 0 && (
                      <Card variant="glass" className="shadow-xl border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Favorites
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-bro-md">
                          {favoriteFriends.map((friend) => (
                            <div
                              key={friend.id}
                              onClick={() => handleFriendClick(friend)}
                              className="flex items-center gap-bro-md p-bro-md rounded-bro-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-102"
                            >
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-full flex items-center justify-center text-white typo-body font-semibold shadow-lg">
                                  {getAvatarFallback(friend.full_name || friend.username || '')}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-bro-sm">
                                  <h3 className="typo-body font-semibold text-primary-navy truncate">
                                    {friend.full_name || friend.username}
                                  </h3>
                                  <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                </div>
                                <p className="typo-mono text-text-secondary">{getStatusText(friend)}</p>
                                {friend.customMessage && (
                                  <p className="typo-mono text-text-muted italic truncate">"{friend.customMessage}"</p>
                                )}
                              </div>
                              
                              <div className="flex gap-bro-xs">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent-orange hover:bg-accent-orange/10">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {onlineFriends.length > 0 && (
                      <Card variant="glass" className="shadow-xl border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Online ({onlineFriends.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-bro-md">
                          {onlineFriends.map((friend) => (
                            <div
                              key={friend.id}
                              onClick={() => handleFriendClick(friend)}
                              className="flex items-center gap-bro-md p-bro-md rounded-bro-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-102"
                            >
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-full flex items-center justify-center text-white typo-body font-semibold shadow-lg">
                                  {getAvatarFallback(friend.full_name || friend.username || '')}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="typo-body font-semibold text-primary-navy truncate">
                                  {friend.full_name || friend.username}
                                </h3>
                                <p className="typo-mono text-text-secondary">{getStatusText(friend)}</p>
                                {friend.customMessage && (
                                  <p className="typo-mono text-text-muted italic truncate">"{friend.customMessage}"</p>
                                )}
                              </div>
                              
                              <div className="flex gap-bro-xs">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-accent-orange hover:bg-accent-orange/10">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {offlineFriends.length > 0 && (
                      <Card variant="glass" className="shadow-xl border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-bro-sm typo-title-md text-primary-navy">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            Offline ({offlineFriends.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-bro-md">
                          {offlineFriends.map((friend) => (
                            <div
                              key={friend.id}
                              onClick={() => handleFriendClick(friend)}
                              className="flex items-center gap-bro-md p-bro-md rounded-bro-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:scale-102"
                            >
                              <div className="relative">
                                <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white typo-body font-semibold shadow-lg">
                                  {getAvatarFallback(friend.full_name || friend.username || '')}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="typo-body font-semibold text-text-secondary truncate">
                                  {friend.full_name || friend.username}
                                </h3>
                                <p className="typo-mono text-text-muted">{getStatusText(friend)}</p>
                                {friend.notes && (
                                  <p className="typo-mono text-text-muted italic truncate">Note: {friend.notes}</p>
                                )}
                              </div>
                              
                              <div className="flex gap-bro-xs">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-text-secondary hover:bg-white/10">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="invitations">
                <FriendInvitations 
                  invitations={invitations} 
                  onInvitationUpdated={() => {
                    handleRefetchInvitations();
                    handleRefetchFriends();
                  }}
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

export default Friends;
