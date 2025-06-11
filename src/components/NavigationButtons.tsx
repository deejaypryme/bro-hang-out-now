
import React from 'react';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationButtonsProps {
  currentStep: 'friend' | 'time' | 'activity';
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
  onSend: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  canProceed,
  onNext,
  onBack,
  onSend
}) => {
  console.log('NavigationButtons render:', { currentStep, canProceed });

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onBack}
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
              onClick={onSend}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Invite
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default NavigationButtons;
