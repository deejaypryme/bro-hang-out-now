import React, { useState } from 'react';
import { useSearchUsers, useSendFriendInvitation } from '@/hooks/useDatabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Search, User, UserPlus, Check } from 'lucide-react';

const SimpleFriendSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  
  const searchUsers = useSearchUsers();
  const sendInvitation = useSendFriendInvitation();
  
  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast({
        title: "Invalid Search",
        description: "Enter at least 2 characters to search",
        variant: "destructive"
      });
      return;
    }
    
    await searchUsers.mutateAsync(searchQuery.trim());
  };
  
  const results = searchUsers.data || [];

  const sendFriendRequest = async (userId: string, username: string | null) => {
    try {
      await sendInvitation.mutateAsync({
        inviteeId: userId,
        message: `Hi! I'd like to be friends so we can hang out together.`
      });
      setSentRequests(prev => new Set([...prev, userId]));
      toast({
        title: "Friend Request Sent!",
        description: `Friend request sent to @${username || 'user'}. They'll be notified instantly!`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searchUsers.isPending}>
              <Search className="w-4 h-4 mr-2" />
              {searchUsers.isPending ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchUsers.isError && (
            <div className="text-sm text-destructive">Failed to search users</div>
          )}

          {searchUsers.isPending ? (
            <div className="text-center py-8 text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {user.full_name?.[0] || user.username?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.full_name || user.username || 'Unknown User'}</div>
                      {user.username && (
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendFriendRequest(user.id, user.username)}
                    disabled={sentRequests.has(user.id) || sendInvitation.isPending}
                    variant={sentRequests.has(user.id) ? "outline" : "default"}
                  >
                    {sentRequests.has(user.id) ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Sent
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Friend
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.trim().length >= 2 && !searchUsers.isPending ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleFriendSearch;
