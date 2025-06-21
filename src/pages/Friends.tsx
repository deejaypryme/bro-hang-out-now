
import React, { useState, useEffect } from 'react';
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

  // Set user presence to online when component mounts
  useEffect(() => {
    if (user) {
      updatePresence.mutate({ status: 'online' });
      
      // Set up real-time subscriptions
      const presenceChannel = friendsService.subscribeToFriendPresence(user.id, (presence) => {
        // Update friend status in real-time
        refetchFriends();
      });
      
      const invitationsChannel = friendsService.subscribeToFriendInvitations(user.id, (invitation) => {
        // Update invitations in real-time
        refetchInvitations();
      });

      return () => {
        // Clean up subscriptions
        presenceChannel.unsubscribe();
        invitationsChannel.unsubscribe();
        
        // Set presence to offline when leaving
        updatePresence.mutate({ status: 'offline' });
      };
    }
  }, [user]);

  // Filter friends based on search query
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
  }, [friends, searchQuery]);

  const handleFriendClick = (friend: FriendWithProfile) => {
    setSelectedFriend(friend);
    setProfileOpen(true);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header userStats={userStats} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading your friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header userStats={userStats} />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Friends</h1>
            <p className="text-gray-600 mt-1">
              {friends.length} friends • {onlineFriends.length + filteredFriends.filter(f => f.favorite && f.status === 'online').length} online
            </p>
          </div>
          <AddFriendModal onFriendAdded={() => refetchInvitations()} />
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Invitations
              {pendingInvitations.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {friends.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Friends Yet</h3>
                  <p className="text-gray-500 mb-6">Start building your network by adding friends!</p>
                  <AddFriendModal onFriendAdded={() => refetchInvitations()} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Favorite Friends */}
                {favoriteFriends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        Favorites
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {favoriteFriends.map((friend) => (
                        <div
                          key={friend.id}
                          onClick={() => handleFriendClick(friend)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {getAvatarFallback(friend.full_name || friend.username || '')}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {friend.full_name || friend.username}
                              </h3>
                              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                            </div>
                            <p className="text-sm text-gray-600">{getStatusText(friend)}</p>
                            {friend.customMessage && (
                              <p className="text-xs text-gray-500 italic truncate">"{friend.customMessage}"</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Online Friends */}
                {onlineFriends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Online ({onlineFriends.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {onlineFriends.map((friend) => (
                        <div
                          key={friend.id}
                          onClick={() => handleFriendClick(friend)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {getAvatarFallback(friend.full_name || friend.username || '')}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {friend.full_name || friend.username}
                            </h3>
                            <p className="text-sm text-gray-600">{getStatusText(friend)}</p>
                            {friend.customMessage && (
                              <p className="text-xs text-gray-500 italic truncate">"{friend.customMessage}"</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Offline Friends */}
                {offlineFriends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        Offline ({offlineFriends.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {offlineFriends.map((friend) => (
                        <div
                          key={friend.id}
                          onClick={() => handleFriendClick(friend)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {getAvatarFallback(friend.full_name || friend.username || '')}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-700 truncate">
                              {friend.full_name || friend.username}
                            </h3>
                            <p className="text-sm text-gray-500">{getStatusText(friend)}</p>
                            {friend.notes && (
                              <p className="text-xs text-gray-400 italic truncate">Note: {friend.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
                refetchInvitations();
                refetchFriends();
              }}
            />
          </TabsContent>
        </Tabs>

        <FriendProfile
          friend={selectedFriend}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          onFriendUpdated={() => refetchFriends()}
        />
      </main>
    </div>
  );
};

export default Friends;
