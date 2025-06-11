
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '../components/ui/button';
import InviteFlow from '../components/InviteFlow';
import NavigationButtons from '../components/NavigationButtons';
import { mockFriends } from '../data/mockData';
import { type Friend, type TimeSlot } from '../data/mockData';
import { type Activity, type EmotionalSignal } from '../data/activities';
import { ArrowLeft } from 'lucide-react';

type Step = 'friend' | 'time' | 'activity';

const Invite = () => {
  const navigate = useNavigate();
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
      case 'friend': 
        return selectedFriend !== null;
      case 'time': 
        return selectedTimes.length > 0;
      case 'activity': 
        return selectedActivity !== null;
      default: 
        return false;
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">Schedule Bro Time</h1>
          </div>
        </div>
      </header>

      {/* Main Content with proper spacing for mobile navigation */}
      <div className="pb-32 md:pb-24">
        <InviteFlow 
          friends={mockFriends}
          currentStep={currentStep}
          completedSteps={completedSteps}
          selectedFriend={selectedFriend}
          selectedTimes={selectedTimes}
          selectedActivity={selectedActivity}
          selectedSignal={selectedSignal}
          onSelectFriend={setSelectedFriend}
          onSelectTime={handleSelectTime}
          onSelectActivity={setSelectedActivity}
          onSelectSignal={setSelectedSignal}
        />
      </div>

      {/* Navigation Buttons - Fixed at bottom with proper mobile spacing */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
        <NavigationButtons
          currentStep={currentStep}
          canProceed={canProceed()}
          onNext={handleNext}
          onBack={handleBack}
          onSend={handleSend}
        />
      </div>
    </div>
  );
};

export default Invite;
