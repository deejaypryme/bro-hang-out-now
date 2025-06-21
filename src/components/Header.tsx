
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HeaderProps {
  userStats: {
    broPoints: number;
    currentStreak: number;
  };
}

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
        navigate('/landing');
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
    <header className="bg-white/90 backdrop-blur-sm text-gray-800 border-b border-gray-200/50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-lg text-white">
              👊
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800">BroYouFree</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!user ? (
              <Button 
                variant="ghost"
                onClick={() => navigate('/landing')}
                className="text-gray-600 hover:text-gray-800"
              >
                About App
              </Button>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Ready to hang</span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-4 bg-gray-100/80 backdrop-blur-sm rounded-lg px-3 md:px-4 py-2 border border-gray-200">
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-semibold text-gray-800">{userStats.broPoints}</div>
                    <div className="text-xs text-gray-600 hidden md:block">Bro Points</div>
                  </div>
                  <div className="w-px h-6 md:h-8 bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-sm md:text-lg font-semibold text-gray-800">{userStats.currentStreak}</div>
                    <div className="text-xs text-gray-600 hidden md:block">Day Streak</div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-800">
                        {profile?.full_name || 'User'}
                      </div>
                      <div className="text-xs text-gray-600">{user?.email}</div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-800">
                          {profile?.full_name || 'User'}
                        </div>
                        <div className="text-xs text-gray-600">{user?.email}</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
