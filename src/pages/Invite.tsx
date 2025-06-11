
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

  // Debug logging
  useEffect(() => {
    console.log('Invite page state:', {
      currentStep,
      selectedFriend: selectedFriend?.name,
      selectedTimes: selectedTimes.length,
      selectedActivity: selectedActivity?.name,
      canProceed: canProceed()
    });
  }, [currentStep, selectedFriend, selectedTimes, selectedActivity]);

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
    <div className="min-h-screen bg-gray-50 pb-20">
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

      {/* Debug Info - Remove this after testing */}
      <div className="max-w-2xl mx-auto px-4 py-2 bg-yellow-100 text-xs">
        <strong>DEBUG:</strong> Step: {currentStep}, Friend: {selectedFriend?.name || 'none'}, 
        Times: {selectedTimes.length}, Activity: {selectedActivity?.name || 'none'}, 
        Can Proceed: {canProceed() ? 'YES' : 'NO'}
      </div>

      {/* Main Content */}
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

      {/* Navigation Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
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
