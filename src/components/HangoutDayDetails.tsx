import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Hangout } from '@/types/database';
import { useNavigate } from 'react-router-dom';

interface HangoutDayDetailsProps {
  date: Date;
  hangouts: Hangout[];
  onClose: () => void;
}

export const HangoutDayDetails: React.FC<HangoutDayDetailsProps> = ({
  date,
  hangouts,
  onClose,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  if (hangouts.length === 0) {
    return (
      <Card variant="glass" className="w-full">
        <CardHeader>
          <CardTitle className="typo-title-md flex items-center gap-bro-sm">
            <Calendar className="w-5 h-5 text-accent-orange" />
            {format(date, 'EEEE, MMMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="typo-body text-text-secondary text-center py-bro-lg">
            No hangouts scheduled for this day
          </p>
          <Button 
            onClick={() => navigate('/invite')} 
            variant="primary"
            className="w-full"
          >
            Schedule a Hangout
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <CardTitle className="typo-title-md flex items-center gap-bro-sm">
          <Calendar className="w-5 h-5 text-accent-orange" />
          {format(date, 'EEEE, MMMM d')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-bro-md">
        {hangouts.map((hangout) => (
          <div
            key={hangout.id}
            className="p-bro-md rounded-bro-md border border-border bg-white hover:border-accent-orange/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-bro-sm">
              <div className="flex items-center gap-bro-sm">
                <span className="text-2xl">{hangout.activity_emoji}</span>
                <div>
                  <h4 className="typo-title-sm">{hangout.activity_name}</h4>
                  <div className="flex items-center gap-bro-xs text-text-secondary typo-body mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{hangout.scheduled_time}</span>
                  </div>
                </div>
              </div>
              <Badge className={cn('capitalize', getStatusColor(hangout.status))}>
                {hangout.status}
              </Badge>
            </div>
            
            {hangout.location && (
              <p className="text-text-secondary typo-body mb-bro-sm">
                📍 {hangout.location}
              </p>
            )}
            
            {/* Note: Friend name would come from joined data in real implementation */}
            <div className="flex items-center gap-bro-sm text-text-secondary typo-body">
              <User className="w-3 h-3" />
              <span>With friend</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
