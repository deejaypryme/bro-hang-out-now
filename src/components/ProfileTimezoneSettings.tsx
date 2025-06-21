
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import TimezoneSelector from './TimezoneSelector';
import { TimeService } from '@/services/timeService';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/database';
import { Globe, MapPin } from 'lucide-react';

const ProfileTimezoneSettings: React.FC = () => {
  const { user } = useAuth();
  const [selectedTimezone, setSelectedTimezone] = useState(
    user?.user_metadata?.timezone || TimeService.getBrowserTimezone()
  );
  const [isUpdating, setIsUpdating] = useState(false);
  
  const browserTimezone = TimeService.getBrowserTimezone();
  const currentTimezone = user?.user_metadata?.timezone || browserTimezone;
  
  const handleUpdateTimezone = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await profileService.updateTimezone(user.id, selectedTimezone);
      
      // Update the user metadata in the auth context
      user.user_metadata = { ...user.user_metadata, timezone: selectedTimezone };
      
      toast.success('Timezone updated successfully');
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast.error('Failed to update timezone');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAutoDetect = () => {
    setSelectedTimezone(browserTimezone);
  };

  const hasChanges = selectedTimezone !== currentTimezone;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Timezone Settings
        </CardTitle>
        <CardDescription>
          Set your timezone to ensure accurate time displays across the app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current timezone display */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Timezone</p>
              <p className="text-sm text-muted-foreground">
                {TimeService.getCommonTimezones().find(tz => tz.timezone === currentTimezone)?.displayName || currentTimezone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono">
                {TimeService.getTimezoneOffset(currentTimezone)}
              </p>
              <p className="text-xs text-muted-foreground">
                {TimeService.getTimezoneAbbreviation(currentTimezone)}
              </p>
            </div>
          </div>
        </div>

        {/* Browser detected timezone */}
        {browserTimezone !== currentTimezone && (
          <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Auto-detected Timezone</p>
                  <p className="text-sm text-blue-700">
                    {TimeService.getCommonTimezones().find(tz => tz.timezone === browserTimezone)?.displayName || browserTimezone}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleAutoDetect}>
                Use This
              </Button>
            </div>
          </div>
        )}

        {/* Timezone selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Timezone</label>
          <TimezoneSelector 
            value={selectedTimezone}
            onChange={setSelectedTimezone}
          />
        </div>

        {/* Current time preview */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Current time in selected timezone:</p>
          <p className="font-mono text-lg">
            {TimeService.formatInTimezone(new Date(), selectedTimezone, 'PPp')}
          </p>
        </div>

        {/* Save button */}
        {hasChanges && (
          <Button 
            onClick={handleUpdateTimezone}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Save Timezone'}
          </Button>
        )}

        {/* Info about timezone usage */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• All times will be displayed in your selected timezone</p>
          <p>• Cross-timezone hangouts will show both times</p>
          <p>• Calendar exports will use your timezone</p>
          <p>• Friends in different timezones will see conversion indicators</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileTimezoneSettings;
