import React, { useState } from 'react';
import { simpleSocialService } from '@/services/simpleSocialService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SimpleHangoutInviteProps {
  friendId: string;
  friendName: string;
  activityName: string;
  activityEmoji: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SimpleHangoutInvite: React.FC<SimpleHangoutInviteProps> = ({
  friendId,
  friendName,
  activityName,
  activityEmoji,
  onSuccess,
  onCancel
}) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Set default date to tomorrow
  React.useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(format(tomorrow, 'yyyy-MM-dd'));
    setTime('19:00'); // 7 PM default
  }, []);

  const sendInvite = async () => {
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      await simpleSocialService.sendHangoutRequest(
        friendId,
        activityName,
        activityEmoji,
        date,
        time,
        message.trim() || undefined
      );

      toast({
        title: "Hangout Invite Sent! 🎉",
        description: `${friendName} will be notified instantly and can accept or decline your invite.`,
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send hangout invite",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{activityEmoji}</span>
          Invite {friendName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send a hangout invitation for <strong>{activityName}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Time
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Message (optional)
          </Label>
          <Textarea
            id="message"
            placeholder="Add a personal message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            {message.length}/200 characters
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={sendInvite}
            disabled={sending || !date || !time}
            className="flex-1"
          >
            {sending ? 'Sending...' : 'Send Invite'}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={sending}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleHangoutInvite;