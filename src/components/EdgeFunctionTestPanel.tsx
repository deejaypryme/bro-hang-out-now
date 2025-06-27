
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { friendsService } from '@/services/friendsService';

const EdgeFunctionTestPanel = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Test invitation from edge function verification');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runEdgeFunctionTest = async () => {
    if (!testEmail && !testPhone) {
      alert('Please provide either an email or phone number for testing');
      return;
    }

    setIsLoading(true);
    setTestResults(null);

    try {
      console.log('🧪 [EdgeFunctionTest] Starting edge function verification test');
      
      const startTime = Date.now();
      const result = await friendsService.sendFriendInvitation({
        inviteeEmail: testEmail || undefined,
        inviteePhone: testPhone || undefined,
        message: testMessage
      });
      const endTime = Date.now();

      setTestResults({
        success: true,
        duration: endTime - startTime,
        invitationId: result.id,
        message: 'Edge function test completed successfully!'
      });

      console.log('✅ [EdgeFunctionTest] Test completed successfully');
    } catch (error: any) {
      console.error('❌ [EdgeFunctionTest] Test failed:', error);
      
      setTestResults({
        success: false,
        error: error.message,
        message: 'Edge function test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Edge Function Verification Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Test Email (Optional)</label>
            <Input
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Test Phone (Optional)</label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Test Message</label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={runEdgeFunctionTest} 
          disabled={isLoading || (!testEmail && !testPhone)}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Testing Edge Function...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Test Edge Function
            </>
          )}
        </Button>

        {testResults && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">{testResults.message}</span>
                <Badge variant={testResults.success ? "default" : "destructive"}>
                  {testResults.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </div>

              {testResults.success && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Duration:</strong> {testResults.duration}ms</p>
                  <p><strong>Invitation ID:</strong> {testResults.invitationId}</p>
                  <p><strong>Status:</strong> Edge function invoked successfully</p>
                </div>
              )}

              {!testResults.success && (
                <div className="text-sm text-red-600">
                  <p><strong>Error:</strong> {testResults.error}</p>
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Note:</strong> This panel tests the edge function integration for friend invitations.</p>
          <p>Check the browser console for detailed logging of the edge function calls.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionTestPanel;
