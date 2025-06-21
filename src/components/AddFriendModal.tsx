
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Phone, User, Search } from 'lucide-react';
import { friendsService } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/types/database';

interface AddFriendModalProps {
  onFriendAdded?: () => void;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onFriendAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await friendsService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not search for users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (type: 'email' | 'phone' | 'user', targetId?: string) => {
    setLoading(true);
    try {
      const invitationData: any = { message };
      
      if (type === 'email') {
        invitationData.inviteeEmail = email;
      } else if (type === 'phone') {
        invitationData.inviteePhone = phone;
      } else if (type === 'user' && targetId) {
        invitationData.inviteeId = targetId;
      }

      await friendsService.sendFriendInvitation(invitationData);
      
      toast({
        title: "Invitation Sent!",
        description: `Friend invitation has been sent successfully.`
      });

      // Reset form
      setEmail('');
      setPhone('');
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
      setOpen(false);
      
      if (onFriendAdded) {
        onFriendAdded();
      }
    } catch (error) {
      toast({
        title: "Failed to Send Invitation",
        description: "Could not send friend invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarFallback = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search by name or username</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Enter name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getAvatarFallback(user.full_name || user.username || '')}
                      </div>
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        {user.username && <p className="text-sm text-gray-500">@{user.username}</p>}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleSendInvitation('user', user.id)}
                      disabled={loading}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleSendInvitation('email')} 
              disabled={loading || !email}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email Invitation
            </Button>
          </TabsContent>
          
          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => handleSendInvitation('phone')} 
              disabled={loading || !phone}
              className="w-full"
            >
              <Phone className="w-4 h-4 mr-2" />
              Send SMS Invitation
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label htmlFor="message">Personal Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Hey! Let's be friends on this app..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
