
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import FriendSelection from './FriendSelection';
import TimeSelection from './TimeSelection';
import ActivitySelection from './ActivitySelection';
import { type Friend, type TimeSlot, mockTimeSlots } from '../data/mockData';
import { type Activity, type EmotionalSignal } from '../data/activities';

interface InviteFlowProps {
  friends: Friend[];
}

type Step = 'friend' | 'time' | 'activity';

const InviteFlow: React.FC<InviteFlowProps> = ({ friends }) => {
  const [currentStep, setCurrentStep] = useState<Step>('friend');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EmotionalSignal | null>(null);

  const handleSelectTime = (timeSlot: TimeSlot) => {
    setSelectedTimes(prev => {
      const exists = prev.some(slot => 
        slot.date.getTime() === timeSlot.date.getTime() && 
        slot.startTime === timeSlot.startTime
      );
      
      if (exists) {
        return prev.filter(slot => 
          !(slot.date.getTime() === timeSlot.date.getTime() && slot.startTime === timeSlot.startTime)
        );
      } else {
        return [...prev, timeSlot];
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'friend': return selectedFriend !== null;
      case 'time': return selectedTimes.length > 0;
      case 'activity': return selectedActivity !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'friend' && selectedFriend) {
      setCurrentStep('time');
    } else if (currentStep === 'time' && selectedTimes.length > 0) {
      setCurrentStep('activity');
    }
  };

  const handleBack = () => {
    if (currentStep === 'time') {
      setCurrentStep('friend');
    } else if (currentStep === 'activity') {
      setCurrentStep('time');
    }
  };

  const handleSend = () => {
    if (selectedFriend && selectedTimes.length > 0 && selectedActivity) {
      console.log('Sending invite:', {
        friend: selectedFriend,
        times: selectedTimes,
        activity: selectedActivity,
        signal: selectedSignal
      });
      
      toast({
        title: "BYF Invite Sent! 🎉",
        description: `Your invite to ${selectedFriend.name} has been sent. They'll get a notification to respond.`,
      });

      // Reset form
      setSelectedFriend(null);
      setSelectedTimes([]);
      setSelectedActivity(null);
      setSelectedSignal(null);
      setCurrentStep('friend');
    }
  };

  const getStepNumber = (step: Step) => {
    switch (step) {
      case 'friend': return 1;
      case 'time': return 2;
      case 'activity': return 3;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {(['friend', 'time', 'activity'] as Step[]).map((step, index) => (
          <React.Fragment key={step}>
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-colors
              ${currentStep === step
                ? 'bg-primary text-white'
                : getStepNumber(currentStep) > getStepNumber(step)
                ? 'bg-success text-white'
                : 'bg-bg-tertiary text-text-muted'
              }
            `}>
              {getStepNumber(currentStep) > getStepNumber(step) ? '✓' : getStepNumber(step)}
            </div>
            {index < 2 && (
              <div className={`
                w-12 h-1 mx-2 rounded-full transition-colors
                ${getStepNumber(currentStep) > getStepNumber(step) + 1
                  ? 'bg-success'
                  : getStepNumber(currentStep) === getStepNumber(step) + 1
                  ? 'bg-primary'
                  : 'bg-bg-tertiary'
                }
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-96 animate-fade-in">
        {currentStep === 'friend' && (
          <FriendSelection
            friends={friends}
            selectedFriend={selectedFriend}
            onSelectFriend={setSelectedFriend}
          />
        )}

        {currentStep === 'time' && (
          <TimeSelection
            timeSlots={mockTimeSlots}
            selectedTimes={selectedTimes}
            onSelectTime={handleSelectTime}
          />
        )}

        {currentStep === 'activity' && (
          <ActivitySelection
            selectedActivity={selectedActivity}
            selectedSignal={selectedSignal}
            onSelectActivity={setSelectedActivity}
            onSelectSignal={setSelectedSignal}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-custom">
        <button
          onClick={handleBack}
          disabled={currentStep === 'friend'}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors
            ${currentStep === 'friend'
              ? 'text-text-muted cursor-not-allowed'
              : 'text-primary hover:bg-primary/10'
            }
          `}
        >
          ← Back
        </button>

        {currentStep === 'activity' ? (
          <button
            onClick={handleSend}
            disabled={!canProceed()}
            className={`
              px-8 py-3 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2
              ${canProceed()
                ? 'btn-primary hover:scale-[1.02] shadow-md'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }
            `}
          >
            <span>📤</span>
            <span>Send BYF Invite</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all duration-150
              ${canProceed()
                ? 'btn-primary hover:scale-[1.02]'
                : 'bg-bg-tertiary text-text-muted cursor-not-allowed'
              }
            `}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteFlow;
