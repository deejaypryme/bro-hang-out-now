import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '../components/ui/button';
import InviteFlow from '../components/InviteFlow';
import { mockFriends } from '../data/mockData';
import { type Friend } from '../data/mockData';
import { type Activity, type EmotionalSignal } from '../data/activities';
import { type TimeOption } from '../components/TimeSelection';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Step = 'friend' | 'time' | 'activity';

const Invite = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('friend');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedTimeOptions, setSelectedTimeOptions] = useState<TimeOption[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EmotionalSignal | null>(null);

  // Auto-advance when friend is selected
  useEffect(() => {
    if (selectedFriend && currentStep === 'friend') {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'friend']);
        setCurrentStep('time');
      }, 500); // Small delay for smooth UX
      
      return () => clearTimeout(timer);
    }
  }, [selectedFriend, currentStep]);

  // Auto-advance only when 4 time options are selected
  useEffect(() => {
    if (selectedTimeOptions.length === 4 && currentStep === 'time') {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'time']);
        setCurrentStep('activity');
      }, 800); // Slightly longer delay to let user see their selection
      
      return () => clearTimeout(timer);
    }
  }, [selectedTimeOptions.length, currentStep]);

  const handleBack = () => {
    if (currentStep === 'time') {
      setCurrentStep('friend');
      setCompletedSteps(prev => prev.filter(step => step !== 'friend'));
    } else if (currentStep === 'activity') {
      setCurrentStep('time');
      setCompletedSteps(prev => prev.filter(step => step !== 'time'));
    }
  };

  const handleNext = () => {
    if (currentStep === 'time' && selectedTimeOptions.length > 0) {
      setCompletedSteps(prev => [...prev, 'time']);
      setCurrentStep('activity');
    }
  };

  const handleSend = () => {
    if (selectedFriend && selectedTimeOptions.length > 0 && selectedActivity) {
      toast({
        title: "BYF Invite Sent! 🎉",
        description: `Your invite to ${selectedFriend.name} has been sent. They'll get a notification to respond.`,
      });

      // Reset form
      setSelectedFriend(null);
      setSelectedTimeOptions([]);
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

      {/* Main Content */}
      <div className="pb-6">
        <InviteFlow 
          friends={mockFriends}
          currentStep={currentStep}
          completedSteps={completedSteps}
          selectedFriend={selectedFriend}
          selectedTimeOptions={selectedTimeOptions}
          selectedActivity={selectedActivity}
          selectedSignal={selectedSignal}
          onSelectFriend={setSelectedFriend}
          onUpdateTimeOptions={setSelectedTimeOptions}
          onSelectActivity={setSelectedActivity}
          onSelectSignal={setSelectedSignal}
          onNext={handleNext}
          onSendInvite={handleSend}
        />
      </div>

      {/* Bottom Navigation - Show on time and activity steps */}
      {(currentStep === 'time' || currentStep === 'activity') && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {currentStep === 'time' ? (
              <Button
                onClick={handleNext}
                disabled={selectedTimeOptions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!selectedActivity}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                Send Invite
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
