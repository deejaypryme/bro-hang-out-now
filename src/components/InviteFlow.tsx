
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import FriendSelection from './FriendSelection';
import TimeSelection, { type TimeOption } from './TimeSelection';
import ActivitySelection from './ActivitySelection';
import { type Friend } from '../data/mockData';
import { type Activity, type EmotionalSignal } from '../data/activities';

interface InviteFlowProps {
  friends: Friend[];
  currentStep: 'friend' | 'time' | 'activity';
  completedSteps: string[];
  selectedFriend: Friend | null;
  selectedTimeOptions: TimeOption[];
  selectedActivity: Activity | null;
  selectedSignal: EmotionalSignal | null;
  onSelectFriend: (friend: Friend) => void;
  onUpdateTimeOptions: (options: TimeOption[]) => void;
  onSelectActivity: (activity: Activity) => void;
  onSelectSignal: (signal: EmotionalSignal | null) => void;
  onNext?: () => void;
  onSendInvite?: () => void; // Add onSendInvite prop
}

const InviteFlow: React.FC<InviteFlowProps> = ({
  friends,
  currentStep,
  completedSteps,
  selectedFriend,
  selectedTimeOptions,
  selectedActivity,
  selectedSignal,
  onSelectFriend,
  onUpdateTimeOptions,
  onSelectActivity,
  onSelectSignal,
  onNext,
  onSendInvite
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if we need to show scroll indicator
  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight + 50);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [currentStep, selectedFriend, selectedTimeOptions.length, selectedActivity]);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator 
            currentStep={currentStep} 
            completedSteps={completedSteps} 
          />
        </div>

        {/* Step Content */}
        <div 
          ref={contentRef}
          className="mb-6 space-y-6"
          style={{ minHeight: 'calc(100vh - 300px)' }}
        >
          {currentStep === 'friend' && (
            <div className="animate-fade-in">
              <FriendSelection
                friends={friends}
                selectedFriend={selectedFriend}
                onSelectFriend={onSelectFriend}
              />
            </div>
          )}

          {currentStep === 'time' && (
            <div className="animate-fade-in">
              <TimeSelection
                selectedOptions={selectedTimeOptions}
                onUpdateOptions={onUpdateTimeOptions}
                onNext={onNext}
              />
            </div>
          )}

          {currentStep === 'activity' && (
            <div className="animate-fade-in">
              <ActivitySelection
                selectedActivity={selectedActivity}
                selectedSignal={selectedSignal}
                onSelectActivity={onSelectActivity}
                onSelectSignal={onSelectSignal}
                onSendInvite={onSendInvite}
              />
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <div 
            onClick={scrollToBottom}
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-blue-600 cursor-pointer animate-bounce z-20"
          >
            <span className="text-xs mb-1">Scroll for more</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteFlow;
