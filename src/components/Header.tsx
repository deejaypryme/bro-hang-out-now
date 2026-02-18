
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { useFriendInvitations, useHangoutInvitations } from '@/hooks/useDatabase';

interface HeaderProps {
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

const NotificationBadge = () => {
  const { data: friendInvitations = [] } = useFriendInvitations();
  const { data: hangoutInvitations = [] } = useHangoutInvitations();
  const count = friendInvitations.filter((i: any) => i.status === 'pending').length + hangoutInvitations.filter((i: any) => i.status === 'pending').length;
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-accent-orange to-accent-light text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
      {count > 9 ? '9+' : count}
    </span>
  );
};

const Header: React.FC<HeaderProps> = ({ userStats }) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="glass-surface border-b border-white/20 shadow-xl">
      <div className="max-w-6xl mx-auto px-bro-lg md:px-bro-xl py-bro-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-bro-md">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-xl text-white shadow-lg">
              👊
            </div>
            <h1 className="typo-title-lg text-primary-navy">BroYouFree</h1>
          </div>
          
          <div className="flex items-center gap-bro-lg">
            {!user ? (
              <Button 
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-text-secondary hover:text-primary-navy"
              >
                About App
              </Button>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-bro-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="typo-body text-text-secondary font-medium">Ready to hang</span>
                </div>
                
                <div className="flex items-center gap-bro-md bg-white/10 backdrop-blur-md rounded-bro-lg px-bro-lg py-bro-md border border-white/20 shadow-lg">
                  <div className="text-center">
                    <div className="typo-title-sm text-primary-navy">{userStats.broPoints}</div>
                    <div className="typo-mono text-text-muted hidden md:block">Bro Points</div>
                  </div>
                  <div className="w-px h-6 md:h-8 bg-white/30"></div>
                  <div className="text-center">
                    <div className="typo-title-sm text-primary-navy">{userStats.currentStreak}</div>
                    <div className="typo-mono text-text-muted hidden md:block">Day Streak</div>
                  </div>
                </div>

                {/* Notification Bell */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="relative p-bro-sm hover:bg-white/10 rounded-bro-lg transition-all duration-300">
                      <Bell className="w-5 h-5 text-primary-navy" />
                      <NotificationBadge />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-96 p-0 border-white/20 shadow-2xl">
                    <NotificationCenter />
                  </PopoverContent>
                </Popover>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-bro-sm hover:bg-white/10 rounded-bro-lg p-bro-sm transition-all duration-300 backdrop-blur-sm"
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-accent-orange to-accent-light text-white typo-body font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="typo-body font-semibold text-primary-navy">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="typo-mono text-text-secondary">{user?.email}</div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-bro-sm w-48 glass-surface rounded-bro-lg shadow-2xl border border-white/20 py-bro-sm z-50">
                      <div className="px-bro-lg py-bro-sm border-b border-white/20">
                        <div className="typo-body font-semibold text-primary-navy">
                          {profile?.full_name || 'User'}
                        </div>
                        <div className="typo-mono text-text-secondary">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                        className="w-full text-left px-bro-lg py-bro-sm typo-body text-primary-navy hover:bg-white/20 transition-colors duration-200"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-bro-lg py-bro-sm typo-body text-red-600 hover:bg-red-50/80 transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
