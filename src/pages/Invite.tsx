import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import InviteFlow from '../components/InviteFlow';
import { hangoutsService } from '@/services/hangoutsService';
import { notificationService } from '@/services/notificationService';
import { type FriendWithProfile } from '@/types/database';
import { type Activity, type EmotionalSignal } from '../data/activities';
import { type TimeOption } from '../components/TimeSelection';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type Step = 'friend' | 'time' | 'activity';

const Invite = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('friend');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendWithProfile | null>(null);
  const [selectedTimeOptions, setSelectedTimeOptions] = useState<TimeOption[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<EmotionalSignal | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{
    success: boolean;
    error?: string;
    retryable?: boolean;
    attempts?: number;
  } | null>(null);

  // Auto-advance when friend is selected
  useEffect(() => {
    if (selectedFriend && currentStep === 'friend') {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'friend']);
        setCurrentStep('time');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [selectedFriend, currentStep]);

  // Auto-advance only when 4 time options are selected
  useEffect(() => {
    if (selectedTimeOptions.length === 4 && currentStep === 'time') {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, 'time']);
        setCurrentStep('activity');
      }, 800);
      
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

  const handleSend = async () => {
    if (!selectedFriend || selectedTimeOptions.length === 0 || !selectedActivity) {
      toast({
        title: "Incomplete Information",
        description: "Please select a friend, time options, and activity.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setNotificationStatus(null);

    try {
      // Create hangout and invitation
      const { hangout, invitation } = await hangoutsService.createHangoutWithInvitation({
        friend: selectedFriend,
        timeOptions: selectedTimeOptions,
        activity: selectedActivity,
        signal: selectedSignal || undefined,
        message: selectedSignal?.description || undefined
      });

      console.log('Created hangout:', hangout);
      console.log('Created invitation:', invitation);

      // Send notification
      const contactType = selectedFriend.phone ? 'sms' : 'email';
      const contact = selectedFriend.phone || selectedFriend.username || '';
      
      if (contact) {
        const notificationResult = await notificationService.sendHangoutInvitation(
          selectedFriend.full_name || selectedFriend.username,
          contact,
          selectedActivity.name,
          selectedActivity.emoji,
          selectedTimeOptions[0].date,
          selectedTimeOptions[0].startTime,
          invitation.invitation_token,
          'You', // For now, using "You" as organizer name
          contactType
        );

        setNotificationStatus(notificationResult);

        if (notificationResult.success) {
          toast({
            title: "BYF Invite Sent! 🎉",
            description: `Your invite to ${selectedFriend.full_name || selectedFriend.username} has been sent via ${contactType}${notificationResult.attempts && notificationResult.attempts > 1 ? ` (after ${notificationResult.attempts} attempts)` : ''}. They'll get a notification to respond.`,
          });
          
          // Navigate back to home on success
          navigate('/home');
        } else {
          // Show error with specific feedback
          const errorTitle = notificationResult.retryable 
            ? "Invite Created - Notification Delayed ⚠️"
            : "Invite Created - Notification Failed ❌";
          
          const errorDescription = notificationResult.retryable
            ? `Your invite has been created, but we couldn't send the notification right now. ${notificationResult.error} We'll keep trying to send it.`
            : `Your invite has been created, but we couldn't send the notification. ${notificationResult.error} You can share the link manually.`;

          toast({
            title: errorTitle,
            description: errorDescription,
            variant: notificationResult.retryable ? "default" : "destructive"
          });

          // Don't navigate away if notification failed, let user see the error and potentially retry
        }
      } else {
        toast({
          title: "Invite Created! ⚠️",
          description: `Your invite has been created, but no contact information is available for ${selectedFriend.full_name || selectedFriend.username}.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error creating hangout invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create hangout invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetryNotification = async () => {
    if (!selectedFriend || !selectedActivity || !selectedTimeOptions.length || !notificationStatus || notificationStatus.success) {
      return;
    }

    setIsCreating(true);

    try {
      const contactType = selectedFriend.phone ? 'sms' : 'email';
      const contact = selectedFriend.phone || selectedFriend.username || '';

      if (contact) {
        // We need the invitation token - this would need to be stored or retrieved
        // For now, we'll show a message that they need to go back to home
        toast({
          title: "Retry from Home",
          description: "Please go back to the home page to retry sending the notification.",
          variant: "default"
        });
        navigate('/home');
      }
    } catch (error) {
      console.error('Error retrying notification:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to retry sending the notification. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen hero-background">
      {/* Header */}
      <header className="glass-surface border-b border-white/20 sticky top-0 z-20 shadow-xl">
        <div className="max-w-2xl mx-auto px-bro-lg py-bro-lg">
          <div className="flex items-center gap-bro-lg">
            <Button
              variant="ghost"
              onClick={() => navigate('/home')}
              className="flex items-center gap-bro-sm text-primary-navy hover:bg-white/10"
              disabled={isCreating}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-bro-md">
              <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-xl text-white shadow-lg">
                📅
              </div>
              <div>
                <h1 className="typo-title-lg text-primary-navy">Schedule Bro Time</h1>
                <p className="typo-mono text-text-secondary">Plan your next hangout</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pb-bro-xl">
        <Card variant="glass" className="max-w-2xl mx-auto mt-bro-xl shadow-2xl border-white/20">
          <CardContent className="pt-bro-lg">
            <InviteFlow 
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

            {/* Notification Status Display */}
            {notificationStatus && !notificationStatus.success && (
              <div className="mt-bro-lg p-bro-md rounded-lg border-l-4 border-amber-500 bg-amber-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-amber-500 text-xl">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-amber-800">
                      Notification Issue
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {notificationStatus.error}
                    </p>
                    {notificationStatus.retryable && (
                      <div className="mt-3">
                        <Button
                          onClick={handleRetryNotification}
                          disabled={isCreating}
                          variant="outline"
                          size="sm"
                          className="text-amber-800 border-amber-300 hover:bg-amber-100"
                        >
                          {isCreating ? 'Retrying...' : 'Retry Notification'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation - Show on time and activity steps */}
      {(currentStep === 'time' || currentStep === 'activity') && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-white/20 p-bro-lg shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-bro-sm"
              disabled={isCreating}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            {currentStep === 'time' ? (
              <Button
                onClick={handleNext}
                disabled={selectedTimeOptions.length === 0 || isCreating}
                variant="primary"
                size="lg"
                className="flex items-center gap-bro-sm"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!selectedActivity || isCreating}
                variant="primary"
                size="lg"
                className="flex items-center gap-bro-sm"
              >
                {isCreating ? 'Sending...' : 'Send Invite'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invite;
