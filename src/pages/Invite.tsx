
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import InviteFlow from '../components/InviteFlow';
import { mockFriends } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

const Invite = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <header className="bg-bg-primary border-b border-default">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg md:text-xl font-semibold">Schedule Bro Time</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <InviteFlow friends={mockFriends} />
      </div>
    </div>
  );
};

export default Invite;
