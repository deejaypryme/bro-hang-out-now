import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { HangoutWithDetails } from '@/types/database';
import { 
  hangoutToCalendarEvent, 
  calendarProviders 
} from '@/lib/calendarUrls';

interface CalendarSelectorProps {
  hangout: HangoutWithDetails;
  onClose?: () => void;
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ hangout, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCalendar = async (providerId: string) => {
    setIsAdding(true);
    setSelectedProvider(providerId);

    try {
      const calendarEvent = hangoutToCalendarEvent(hangout);
      const provider = calendarProviders.find(p => p.id === providerId);
      
      if (!provider) {
        throw new Error('Calendar provider not found');
      }

      const calendarUrl = provider.generateUrl(calendarEvent);
      
      // For Apple Calendar (ICS download), we handle it differently
      if (providerId === 'apple') {
        const link = document.createElement('a');
        link.href = calendarUrl;
        link.download = `BroYouFree-${hangout.activity_name}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Calendar Event Downloaded",
          description: "The .ics file has been downloaded. Open it to add to Apple Calendar.",
        });
      } else {
        // Open calendar service in new tab
        window.open(calendarUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Opening Calendar",
          description: `Redirecting to ${provider.name}...`,
        });
      }

      // Show success state briefly
      setTimeout(() => {
        setSelectedProvider(null);
        setIsAdding(false);
        onClose?.();
      }, 2000);

    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast({
        title: "Error",
        description: "Failed to add event to calendar. Please try again.",
        variant: "destructive"
      });
      setSelectedProvider(null);
      setIsAdding(false);
    }
  };

  if (selectedProvider && isAdding) {
    return (
      <Card variant="glass" className="max-w-md mx-auto">
        <CardContent className="text-center py-bro-xl">
          <div className="mb-bro-lg">
            <CheckCircle className="w-16 h-16 text-accent-green mx-auto animate-scale-in" />
          </div>
          <h3 className="typo-title-lg text-primary-navy mb-bro-sm">
            Your Meeting has been Scheduled
          </h3>
          <p className="typo-body text-text-secondary">
            Adding to {calendarProviders.find(p => p.id === selectedProvider)?.name}...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="typo-title-lg text-primary-navy">
          Add to Calendar
        </CardTitle>
        <p className="typo-body text-text-secondary">
          Choose your preferred calendar app
        </p>
      </CardHeader>
      
      <CardContent className="space-y-bro-md">
        {/* Event Preview */}
        <div className="bg-surface-elevated rounded-bro-lg p-bro-md border border-primary-navy/10">
          <div className="flex items-center gap-bro-sm mb-bro-xs">
            <span className="text-2xl">{hangout.activity_emoji}</span>
            <h4 className="typo-body font-medium text-primary-navy">
              {hangout.activity_name}
            </h4>
          </div>
          <p className="typo-mono text-text-secondary text-sm">
            {new Date(hangout.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long', 
              day: 'numeric'
            })} at {hangout.scheduled_time}
          </p>
          {hangout.location && (
            <p className="typo-mono text-text-secondary text-sm">
              📍 {hangout.location}
            </p>
          )}
        </div>

        {/* Calendar Provider Buttons */}
        <div className="space-y-bro-sm">
          {calendarProviders.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => handleAddToCalendar(provider.id)}
              disabled={isAdding}
              variant="outline"
              className="w-full justify-between h-12 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-bro-sm">
                <span className="text-xl">{provider.icon}</span>
                <span className="typo-body">{provider.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-text-secondary" />
            </Button>
          ))}
        </div>

        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full mt-bro-lg"
            disabled={isAdding}
          >
            Maybe Later
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarSelector;