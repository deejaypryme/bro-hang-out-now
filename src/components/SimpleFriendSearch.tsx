import React, { useState, useEffect } from 'react';
import { simpleSocialService } from '@/services/simpleSocialService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Search, User, UserPlus, Check } from 'lucide-react';

interface UserSearchResult {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const SimpleFriendSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const users = await simpleSocialService.searchUsersByUsername(searchQuery);
      setResults(users);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const sendFriendRequest = async (userId: string, username: string | null) => {
    setSendingTo(userId);
    try {
      await simpleSocialService.sendFriendRequest(userId, `Hi! I'd like to be friends so we can hang out together.`);
      setSentRequests(prev => new Set([...prev, userId]));
      toast({
        title: "Friend Request Sent!",
        description: `Friend request sent to @${username || 'user'}. They'll be notified instantly!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send friend request",
        variant: "destructive"
      });
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.full_name || 'Unknown User'}
                      </p>
                      {user.username && (
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {sentRequests.has(user.id) ? (
                    <Button size="sm" variant="outline" disabled className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user.id, user.username)}
                      disabled={sendingTo === user.id}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {sendingTo === user.id ? 'Sending...' : 'Add Friend'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No users found for "{query}"</p>
          <p className="text-sm mt-2">Try searching by username</p>
        </div>
      )}
    </div>
  );
};

export default SimpleFriendSearch;