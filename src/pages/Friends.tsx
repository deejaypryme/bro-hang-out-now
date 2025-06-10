
import React from 'react';
import Header from '../components/Header';
import FriendSelection from '../components/FriendSelection';
import { mockFriends, mockUserStats } from '../data/mockData';

const Friends = () => {
  const [selectedFriend, setSelectedFriend] = React.useState(null);

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Header userStats={mockUserStats} />
      
      {/* Mobile-first friends layout */}
      <div className="p-4">
        <div className="max-w-md mx-auto md:max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">
              Your Friends
            </h2>
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
              Add Friend
            </button>
          </div>
          
          <div className="bg-bg-primary rounded-2xl shadow-lg p-6 border border-custom">
            <FriendSelection
              friends={mockFriends}
              selectedFriend={selectedFriend}
              onSelectFriend={setSelectedFriend}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
