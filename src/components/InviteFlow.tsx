
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Button } from './ui/button';
import ProgressIndicator from './ProgressIndicator';
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
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
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
    if (!canProceed()) return;

    const currentStepCompleted = currentStep;
    setCompletedSteps(prev => [...prev, currentStepCompleted]);

    if (currentStep === 'friend') {
      setCurrentStep('time');
    } else if (currentStep === 'time') {
      setCurrentStep('activity');
    }
  };

  const handleBack = () => {
    if (currentStep === 'time') {
      setCurrentStep('friend');
      setCompletedSteps(prev => prev.filter(step => step !== 'friend'));
    } else if (currentStep === 'activity') {
      setCurrentStep('time');
      setCompletedSteps(prev => prev.filter(step => step !== 'time'));
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
      setCompletedSteps([]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-lg">
      {/* Progress Indicator */}
      <ProgressIndicator 
        currentStep={currentStep} 
        completedSteps={completedSteps} 
      />

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
      <div className="flex items-center justify-between pt-md border-t border-default">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 'friend'}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {currentStep === 'activity' ? (
          <Button
            onClick={handleSend}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send BYF Invite
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InviteFlow;
