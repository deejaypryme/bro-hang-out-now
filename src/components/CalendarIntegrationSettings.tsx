
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Settings, RefreshCw, Trash2, ExternalLink } from 'lucide-react';
import { calendarIntegrationService, CalendarIntegration } from '@/services/calendarIntegrationService';
import { useToast } from '@/hooks/use-toast';

const CalendarIntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const data = await calendarIntegrationService.getUserIntegrations();
      setIntegrations(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load calendar integrations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const authUrl = await calendarIntegrationService.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Google Calendar',
        variant: 'destructive'
      });
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const authUrl = await calendarIntegrationService.getOutlookAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Outlook Calendar',
        variant: 'destructive'
      });
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      setIsSyncing(integrationId);
      await calendarIntegrationService.syncCalendarEvents(integrationId);
      toast({
        title: 'Success',
        description: 'Calendar events synced successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync calendar events',
        variant: 'destructive'
      });
    } finally {
      setIsSyncing(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      await calendarIntegrationService.disconnectIntegration(integrationId);
      await loadIntegrations();
      toast({
        title: 'Success',
        description: 'Calendar disconnected successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect calendar',
        variant: 'destructive'
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '📅';
      case 'outlook':
        return '📧';
      case 'apple':
        return '🍎';
      default:
        return '📅';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google Calendar';
      case 'outlook':
        return 'Outlook Calendar';
      case 'apple':
        return 'Apple Calendar';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Calendar Integrations</h2>
      </div>

      {/* Connection Options */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Calendars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleConnectGoogle}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <span>📅</span>
              <span>Connect Google Calendar</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={handleConnectOutlook}
              className="flex items-center space-x-2"
              variant="outline"
            >
              <span>📧</span>
              <span>Connect Outlook Calendar</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Calendars</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading integrations...</div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No calendars connected</p>
              <p className="text-sm">Connect your calendars to sync events automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getProviderIcon(integration.provider)}</span>
                    <div>
                      <div className="font-medium">{integration.calendarName}</div>
                      <div className="text-sm text-gray-500">
                        {getProviderName(integration.provider)}
                      </div>
                      {integration.lastSyncAt && (
                        <div className="text-xs text-gray-400">
                          Last synced: {new Date(integration.lastSyncAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                      {integration.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id)}
                      disabled={isSyncing === integration.id}
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing === integration.id ? 'animate-spin' : ''}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarIntegrationSettings;
