
import React from 'react';
import { Plus } from 'lucide-react';
import { type Friend } from '../data/mockData';

interface FriendSelectionProps {
  friends: Friend[];
  selectedFriend: Friend | null;
  onSelectFriend: (friend: Friend) => void;
}

const FriendSelection: React.FC<FriendSelectionProps> = ({
  friends,
  selectedFriend,
  onSelectFriend
}) => {
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    return colors[name.length % colors.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (friend: Friend) => {
    switch (friend.status) {
      case 'online': return 'Available now';
      case 'busy': return 'Busy';
      default: return `Last seen ${friend.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Who do you want to hang with?</h3>
        <p className="text-sm text-foreground/70">Select a friend to send your invite to</p>
      </div>
      
      <div className="space-y-3">
        {friends.map((friend) => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend)}
            className={`
              p-4 min-h-[60px] transition-all duration-200 cursor-pointer rounded-xl border-2
              ${selectedFriend?.id === friend.id 
                ? 'bg-blue-50 border-blue-500 shadow-md scale-[1.02]' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:scale-[1.01]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(friend.name)}`}>
                  {friend.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900">{friend.name}</div>
                <div className="text-sm text-gray-600">{getStatusText(friend)}</div>
                <div className="text-xs text-gray-500">
                  Usually free {friend.preferredTimes.join(', ')}
                </div>
              </div>
              
              {selectedFriend?.id === friend.id && (
                <div className="text-blue-500 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full p-4 min-h-[60px] text-center rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group">
        <div className="flex items-center justify-center gap-2">
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add a new friend</span>
        </div>
      </button>
    </div>
  );
};

export default FriendSelection;
