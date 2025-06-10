
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
    <div className="w-full max-w-md mx-auto space-md">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4">
          <span className="caption text-muted">{progressPercentage}%</span>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const state = getStepState(step);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-xs">
                <div className={`progress-step ${state}`}>
                  {state === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="caption font-semibold">{step.number}</span>
                  )}
                </div>
                <span className={`caption ${
                  state === 'active' 
                    ? 'text-primary font-semibold' 
                    : state === 'completed' 
                    ? 'text-success font-medium' 
                    : 'text-muted'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-bg-tertiary relative">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                      completedSteps.includes(step.id) 
                        ? 'bg-success w-full' 
                        : currentStep === step.id 
                        ? 'bg-primary w-1/2' 
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
