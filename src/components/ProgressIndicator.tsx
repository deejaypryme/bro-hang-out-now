
import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: 'friend' | 'time' | 'activity';
  completedSteps: string[];
}

type StepConfig = {
  id: 'friend' | 'time' | 'activity';
  label: string;
  number: number;
  percentage: number;
};

const steps: StepConfig[] = [
  { id: 'friend', label: 'Friend', number: 1, percentage: 33 },
  { id: 'time', label: 'Time', number: 2, percentage: 66 },
  { id: 'activity', label: 'Activity', number: 3, percentage: 100 }
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  completedSteps 
}) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getStepState = (step: StepConfig) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (step.id === currentStep) return 'active';
    return 'inactive';
  };

  const currentStepIndex = getCurrentStepIndex();
  const progressPercentage = currentStepIndex >= 0 ? steps[currentStepIndex].percentage : 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4">
          <span className="text-xs text-gray-500">{progressPercentage}%</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step);
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                  ${state === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : state === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {state === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.number}</span>
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  state === 'active' 
                    ? 'text-blue-600' 
                    : state === 'completed' 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                      completedSteps.includes(step.id) 
                        ? 'bg-green-500 w-full' 
                        : currentStep === step.id 
                        ? 'bg-blue-600 w-1/2' 
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
