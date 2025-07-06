
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Phone, User, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { friendsService } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';
import validator from 'validator';
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

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: '', description: '', action: () => {} });

  // Enhanced validation functions using validator library
  const validateEmail = (emailValue: string) => {
    if (!emailValue) {
      setEmailError('');
      return true;
    }
    
    if (!validator.isEmail(emailValue)) {
      setEmailError('Please enter a valid email address (e.g., user@example.com)');
      return false;
    }
    
    if (emailValue.length > 254) {
      setEmailError('Email address is too long (maximum 254 characters)');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const validatePhone = (phoneValue: string) => {
    if (!phoneValue) {
      setPhoneError('');
      return true;
    }
    
    const cleanPhone = phoneValue.replace(/[\s\-\(\)\.]/g, '');
    
    if (!validator.isMobilePhone(cleanPhone, 'any', { strictMode: false })) {
      setPhoneError('Please enter a valid phone number (e.g., +1234567890)');
      return false;
    }
    
    if (cleanPhone.length > 15) {
      setPhoneError('Phone number is too long (maximum 15 digits)');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const validateSearchQuery = (query: string) => {
    if (!query.trim()) {
      setSearchError('Search query cannot be empty');
      return false;
    }
    
    if (query.trim().length < 2) {
      setSearchError('Search query must be at least 2 characters');
      return false;
    }
    
    if (query.length > 50) {
      setSearchError('Search query is too long (maximum 50 characters)');
      return false;
    }
    
    setSearchError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    validatePhone(value);
  };

  const handleSearch = async () => {
    if (!validateSearchQuery(searchQuery)) return;
    
    setLoading(true);
    try {
      const results = await friendsService.searchUsers(searchQuery.trim());
      setSearchResults(results);
      setSearchError('');
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error instanceof Error ? error.message : "Could not search for users. Please try again.";
      setSearchError(errorMessage);
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmSendInvitation = (type: 'email' | 'phone' | 'user', targetId?: string, targetName?: string) => {
    let description = '';
    let recipient = '';
    
    if (type === 'email') {
      recipient = email.trim();
      description = `Send a friend invitation to ${recipient}?`;
    } else if (type === 'phone') {
      recipient = phone.trim();
      description = `Send a friend invitation via SMS to ${recipient}?`;
    } else if (type === 'user' && targetName) {
      recipient = targetName;
      description = `Send a friend invitation to ${recipient}?`;
    }
    
    setConfirmDialog({
      open: true,
      title: 'Confirm Friend Invitation',
      description,
      action: () => handleSendInvitation(type, targetId)
    });
  };

  const handleSendInvitation = async (type: 'email' | 'phone' | 'user', targetId?: string) => {
    // Enhanced validation before sending
    if (type === 'email') {
      if (!email.trim()) {
        toast({
          title: "Email Required",
          description: "Please enter an email address.",
          variant: "destructive"
        });
        return;
      }
      if (!validateEmail(email.trim())) {
        return;
      }
    } else if (type === 'phone') {
      if (!phone.trim()) {
        toast({
          title: "Phone Required",
          description: "Please enter a phone number.",
          variant: "destructive"
        });
        return;
      }
      if (!validatePhone(phone.trim())) {
        return;
      }
    } else if (type === 'user' && !targetId) {
      toast({
        title: "User Required",
        description: "Please select a user to invite.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const invitationData: any = { 
        message: message.trim() || undefined 
      };
      
      if (type === 'email') {
        invitationData.inviteeEmail = validator.normalizeEmail(email.trim());
      } else if (type === 'phone') {
        const cleanPhone = phone.trim().replace(/[\s\-\(\)\.]/g, '');
        invitationData.inviteePhone = cleanPhone;
      } else if (type === 'user' && targetId) {
        invitationData.inviteeId = targetId;
      }

      await friendsService.sendFriendInvitation(invitationData);
      
      toast({
        title: "Invitation Sent! 🎉",
        description: `Friend invitation has been sent successfully.`
      });

      // Reset form with all validation states
      setEmail('');
      setPhone('');
      setMessage('');
      setSearchQuery('');
      setSearchResults([]);
      setEmailError('');
      setPhoneError('');
      setSearchError('');
      setOpen(false);
      
      if (onFriendAdded) {
        onFriendAdded();
      }
    } catch (error) {
      console.error('Invitation error:', error);
      
      let errorMessage = "Could not send friend invitation. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to Send Invitation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setConfirmDialog(prev => ({ ...prev, open: false }));
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    validateSearchQuery(e.target.value);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={searchError ? 'border-red-500' : ''}
                />
                <Button onClick={handleSearch} disabled={loading || !!searchError} size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {searchError && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {searchError}
                </div>
              )}
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
                      onClick={() => confirmSendInvitation('user', user.id, user.full_name || user.username)}
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
                onChange={handleEmailChange}
                className={emailError ? 'border-red-500' : (email && !emailError ? 'border-green-500' : '')}
              />
              {emailError ? (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </div>
              ) : email && !emailError ? (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Valid email address
                </div>
              ) : null}
            </div>
            <Button 
              onClick={() => confirmSendInvitation('email')} 
              disabled={loading || !email || !!emailError}
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
                onChange={handlePhoneChange}
                className={phoneError ? 'border-red-500' : (phone && !phoneError ? 'border-green-500' : '')}
              />
              {phoneError ? (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {phoneError}
                </div>
              ) : phone && !phoneError ? (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Valid phone number
                </div>
              ) : null}
            </div>
            <Button 
              onClick={() => confirmSendInvitation('phone')} 
              disabled={loading || !phone || !!phoneError}
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
        
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDialog.action}>Send Invitation</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
