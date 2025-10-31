import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  onDismiss?: () => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onDismiss }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card variant="glass" className="relative border-accent-orange/30 shadow-glow">
      <CardContent className="py-bro-md px-bro-lg">
        <button
          onClick={handleDismiss}
          className="absolute top-bro-md right-bro-md text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss welcome message"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-bro-md pr-bro-xl">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 space-y-bro-xs">
            <h3 className="typo-subheading text-white">
              Welcome to BroYouFree! 👊
            </h3>
            <p className="typo-body-sm text-white/80">
              Start by adding friends to schedule hangouts and never miss quality time together.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
