import React, { useState, useEffect } from 'react';
import { simpleSocialService } from '@/services/simpleSocialService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Search, User, UserPlus, Check, AlertCircle } from 'lucide-react';
import validator from 'validator';

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
  const [queryError, setQueryError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: '', description: '', action: () => {} });

  const validateQuery = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setQueryError('');
      return true;
    }
    
    if (searchQuery.trim().length < 2) {
      setQueryError('Search must be at least 2 characters');
      return false;
    }
    
    if (searchQuery.length > 50) {
      setQueryError('Search is too long (maximum 50 characters)');
      return false;
    }
    
    if (!/^[a-zA-Z0-9\s@._-]+$/.test(searchQuery)) {
      setQueryError('Search contains invalid characters');
      return false;
    }
    
    setQueryError('');
    return true;
  };

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setQueryError('');
      return;
    }

    if (!validateQuery(searchQuery)) {
      return;
    }

    setLoading(true);
    try {
      const users = await simpleSocialService.searchUsersByUsername(searchQuery.trim());
      setResults(users);
      setQueryError('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search users";
      setQueryError(errorMessage);
      toast({
        title: "Search Error",
        description: errorMessage,
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

  const confirmSendFriendRequest = (userId: string, username: string | null) => {
    const displayName = username || 'this user';
    setConfirmDialog({
      open: true,
      title: 'Send Friend Request',
      description: `Send a friend request to @${displayName}? They'll be notified instantly.`,
      action: () => sendFriendRequest(userId, username)
    });
  };

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
      setConfirmDialog(prev => ({ ...prev, open: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by username..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            validateQuery(e.target.value);
          }}
          className={`pl-10 ${queryError ? 'border-red-500' : ''}`}
        />
      </div>
      {queryError && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {queryError}
        </div>
      )}

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
                      onClick={() => confirmSendFriendRequest(user.id, user.username)}
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
      
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.action}>Send Request</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SimpleFriendSearch;