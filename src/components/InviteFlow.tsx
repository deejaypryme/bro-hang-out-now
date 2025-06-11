
import React, { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, ChevronDown } from 'lucide-react';
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
  }, [currentStep, selectedFriend, selectedTimes.length, selectedActivity]);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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

    // Scroll to top when switching steps
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
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

    // Scroll to top when switching steps
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
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
    <div className="w-full max-w-lg mx-auto relative min-h-screen pb-24">
      {/* Progress Indicator */}
      <div className="mb-6">
        <ProgressIndicator 
          currentStep={currentStep} 
          completedSteps={completedSteps} 
        />
      </div>

      {/* Step Content */}
      <div 
        ref={contentRef}
        className="space-y-6 animate-fade-in"
      >
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

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div 
          onClick={scrollToBottom}
          className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-primary cursor-pointer animate-bounce z-20"
        >
          <span className="text-xs mb-1">Scroll for more</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      )}

      {/* Fixed Navigation Buttons - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 'friend'}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep === 'activity' ? (
            <Button
              onClick={handleSend}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send BYF Invite
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteFlow;
