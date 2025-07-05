
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from '@/hooks/use-toast';
import { hangoutsService } from '@/services/hangoutsService';
import { notificationService } from '@/services/notificationService';
import { CalendarDays, Clock, MapPin, User } from 'lucide-react';
import CalendarSelector from './CalendarSelector';
import type { HangoutWithDetails } from '@/types/database';
import type { HangoutInvitation } from '@/services/hangoutsService';

const HangoutResponse: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [hangout, setHangout] = useState<HangoutWithDetails | null>(null);
  const [invitation, setInvitation] = useState<HangoutInvitation | null>(null);
  const [hasResponded, setHasResponded] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const loadHangoutDetails = async () => {
      if (!token) {
        toast({
          title: "Invalid Link",
          description: "This invitation link is not valid.",
          variant: "destructive"
        });
        return;
      }

      try {
        const result = await hangoutsService.getHangoutByInvitationToken(token);
        
        if (!result) {
          toast({
            title: "Invitation Not Found",
            description: "This invitation may have expired or been cancelled.",
            variant: "destructive"
          });
          return;
        }

        setHangout(result.hangout);
        setInvitation(result.invitation);
        setHasResponded(result.invitation.status !== 'pending');
      } catch (error) {
        console.error('Error loading hangout details:', error);
        toast({
          title: "Error",
          description: "Unable to load invitation details.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadHangoutDetails();
  }, [token]);

  const handleResponse = async (response: 'accepted' | 'declined') => {
    if (!invitation || !hangout) return;

    setResponding(true);
    
    try {
      await hangoutsService.respondToInvitation(invitation.id, response);
      
      // Send notification to organizer
      const organizerProfile = await fetch(`/api/profiles/${hangout.organizer_id}`).catch(() => null);
      
      setHasResponded(true);
      setInvitation(prev => prev ? { ...prev, status: response } : null);

      toast({
        title: response === 'accepted' ? "Invitation Accepted!" : "Invitation Declined",
        description: response === 'accepted' 
          ? "Great! Your hangout has been confirmed." 
          : "You've declined this invitation.",
      });

      // Redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Unable to respond to invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white mx-auto mb-4 animate-pulse">
            👊
          </div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (!hangout || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold mb-2">Invitation Not Found</h2>
            <p className="text-gray-600 mb-4">
              This invitation may have expired or been cancelled.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">{hangout.activity_emoji}</div>
            <CardTitle className="text-xl">
              {hasResponded ? (
                invitation.status === 'accepted' ? "You're Going!" : "Invitation Declined"
              ) : (
                "You're Invited!"
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Organizer */}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Invited by</p>
                <p className="font-medium">{hangout.friendName}</p>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {hangout.activity_emoji} {hangout.activity_name}
              </h3>
            </div>

            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(hangout.scheduled_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{hangout.scheduled_time}</p>
                </div>
              </div>

              {hangout.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{hangout.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message */}
            {invitation.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">"{invitation.message}"</p>
              </div>
            )}

            {/* Status */}
            {hasResponded ? (
              invitation.status === 'accepted' ? (
                <CalendarSelector 
                  hangout={hangout}
                  onClose={() => navigate('/')}
                />
              ) : (
                <div className="text-center py-4 bg-gray-50 text-gray-600 rounded-lg">
                  <p className="font-medium">You've declined this invitation.</p>
                </div>
              )
            ) : isExpired ? (
              <div className="text-center py-4 bg-red-50 text-red-800 rounded-lg">
                <p className="font-medium">This invitation has expired</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => handleResponse('accepted')}
                  disabled={responding}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {responding ? 'Responding...' : "I'm in! 🎉"}
                </Button>
                
                <Button
                  onClick={() => handleResponse('declined')}
                  disabled={responding}
                  variant="outline"
                  className="w-full"
                >
                  {responding ? 'Responding...' : 'Can\'t make it'}
                </Button>
              </div>
            )}

            <div className="text-center pt-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
              >
                Go to BroYourFriend
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HangoutResponse;
