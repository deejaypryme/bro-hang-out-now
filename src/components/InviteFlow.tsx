
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

  // Debug logging
  useEffect(() => {
    console.log('InviteFlow state:', {
      currentStep,
      selectedFriend: selectedFriend?.name,
      selectedTimes: selectedTimes.length,
      selectedActivity: selectedActivity?.name,
      canProceed: canProceed()
    });
  }, [currentStep, selectedFriend, selectedTimes, selectedActivity]);

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
    console.log('Checking canProceed for step:', currentStep);
    switch (currentStep) {
      case 'friend': 
        const friendResult = selectedFriend !== null;
        console.log('Friend step can proceed:', friendResult, selectedFriend?.name);
        return friendResult;
      case 'time': 
        const timeResult = selectedTimes.length > 0;
        console.log('Time step can proceed:', timeResult, selectedTimes.length);
        return timeResult;
      case 'activity': 
        const activityResult = selectedActivity !== null;
        console.log('Activity step can proceed:', activityResult, selectedActivity?.name);
        return activityResult;
      default: 
        return false;
    }
  };

  const handleNext = () => {
    console.log('handleNext called, canProceed:', canProceed());
    if (!canProceed()) return;

    const currentStepCompleted = currentStep;
    setCompletedSteps(prev => {
      const newCompleted = [...prev, currentStepCompleted];
      console.log('Updated completed steps:', newCompleted);
      return newCompleted;
    });

    if (currentStep === 'friend') {
      console.log('Moving from friend to time step');
      setCurrentStep('time');
    } else if (currentStep === 'time') {
      console.log('Moving from time to activity step');
      setCurrentStep('activity');
    }

    // Scroll to top when switching steps
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleBack = () => {
    console.log('handleBack called from step:', currentStep);
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
          className="mb-24 space-y-6"
          style={{ minHeight: 'calc(100vh - 300px)' }}
        >
          {currentStep === 'friend' && (
            <div className="animate-fade-in">
              <FriendSelection
                friends={friends}
                selectedFriend={selectedFriend}
                onSelectFriend={setSelectedFriend}
              />
            </div>
          )}

          {currentStep === 'time' && (
            <div className="animate-fade-in">
              <TimeSelection
                timeSlots={mockTimeSlots}
                selectedTimes={selectedTimes}
                onSelectTime={handleSelectTime}
              />
            </div>
          )}

          {currentStep === 'activity' && (
            <div className="animate-fade-in">
              <ActivitySelection
                selectedActivity={selectedActivity}
                selectedSignal={selectedSignal}
                onSelectActivity={setSelectedActivity}
                onSelectSignal={setSelectedSignal}
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

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'friend'}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <div className="text-sm text-gray-500">
                Step {currentStep === 'friend' ? '1' : currentStep === 'time' ? '2' : '3'} of 3
              </div>

              {currentStep === 'activity' ? (
                <Button
                  onClick={handleSend}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Invite
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFlow;
