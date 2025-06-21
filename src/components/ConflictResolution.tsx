
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertTriangle, Clock, Calendar, Users, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ConflictDetectionResult, ConflictDetails } from '@/services/conflictDetectionService';
import type { TimeOption } from './TimeSelection';

interface ConflictResolutionProps {
  conflicts: ConflictDetectionResult;
  originalTime: TimeOption;
  onSelectAlternative: (timeOption: TimeOption) => void;
  onIgnoreConflicts: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({
  conflicts,
  originalTime,
  onSelectAlternative,
  onIgnoreConflicts,
  onCancel,
  isLoading = false
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState<TimeOption | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'hangout': return <Users className="w-4 h-4" />;
      case 'availability': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleSelectAlternative = (alternative: TimeOption) => {
    setSelectedAlternative(alternative);
    onSelectAlternative(alternative);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Conflict Alert */}
      <Alert className={cn("border-2", getSeverityColor(conflicts.severity))}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          {conflicts.severity === 'high' && 'Multiple scheduling conflicts detected'}
          {conflicts.severity === 'medium' && 'Scheduling conflict detected'}
          {conflicts.severity === 'low' && 'Minor scheduling overlap detected'}
        </AlertDescription>
      </Alert>

      {/* Original Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Your Selected Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">
              {format(new Date(originalTime.date), 'EEEE, MMM d')} at{' '}
              {format(new Date(`2024-01-01T${originalTime.startTime}`), 'h:mm a')}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Duration: {originalTime.endTime} - {originalTime.startTime}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Conflicts Found ({conflicts.conflicts.length})
          </CardTitle>
          <CardDescription>
            The following items conflict with your selected time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {conflicts.conflicts.map((conflict, index) => (
            <div key={conflict.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getConflictIcon(conflict.type)}
                  <div>
                    <p className="font-medium">{conflict.title}</p>
                    <p className="text-sm text-gray-600">
                      {format(conflict.startTime, 'h:mm a')} - {format(conflict.endTime, 'h:mm a')}
                    </p>
                    {conflict.description && (
                      <p className="text-xs text-gray-500 mt-1">{conflict.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {conflict.type}
                  </Badge>
                  {conflict.canReschedule && (
                    <Badge variant="secondary" className="text-xs">
                      Can reschedule
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alternative Times */}
      {conflicts.alternativeTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-500" />
              Suggested Alternatives
            </CardTitle>
            <CardDescription>
              Here are some conflict-free times that work for both of you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {conflicts.alternativeTimes.map((alternative, index) => (
              <div
                key={alternative.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                  selectedAlternative?.id === alternative.id && "border-blue-500 bg-blue-50"
                )}
                onClick={() => handleSelectAlternative(alternative)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {format(new Date(alternative.date), 'EEEE, MMM d')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(`2024-01-01T${alternative.startTime}`), 'h:mm a')} -{' '}
                      {format(new Date(`2024-01-01T${alternative.endTime}`), 'h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs text-green-600">
                      Available
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>

        {conflicts.severity === 'low' && (
          <Button
            onClick={onIgnoreConflicts}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            Continue Anyway
          </Button>
        )}

        {selectedAlternative && (
          <Button
            onClick={() => handleSelectAlternative(selectedAlternative)}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Use Selected Time'}
          </Button>
        )}

        {conflicts.alternativeTimes.length === 0 && (
          <Button
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Choose Different Time
          </Button>
        )}
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        {conflicts.alternativeTimes.length > 0 
          ? "Select an alternative time above, or go back to choose a different time"
          : "No alternative times found. Please select a different time manually."
        }
      </div>
    </div>
  );
};

export default ConflictResolution;
