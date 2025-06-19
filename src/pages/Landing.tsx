
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing emails from localStorage
      const existingEmails = JSON.parse(localStorage.getItem('broYouFreeEmails') || '[]');
      
      // Check if email already exists
      if (existingEmails.includes(email)) {
        toast({
          title: "Already signed up!",
          description: "You're already on our early access list.",
        });
        setEmail('');
        return;
      }

      // Add new email to the list
      const updatedEmails = [...existingEmails, email];
      localStorage.setItem('broYouFreeEmails', JSON.stringify(updatedEmails));

      toast({
        title: "Success!",
        description: "You're now on the early access list. We'll be in touch soon!",
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-2xl text-white">
              👊
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">BroYouFree</h1>
          </div>
          
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Turn "maybe later" into confirmed plans. Finally coordinate hangouts that actually happen.
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/home')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Try the App
            </Button>
            <Button 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Dave & Matt Story Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Meet Dave & Matt
            </h3>
            <div className="bg-gray-50 rounded-lg p-8 text-left">
              <p className="text-lg text-gray-700 mb-4">
                <strong>Dave:</strong> "Hey Matt, want to grab dinner this week?"
              </p>
              <p className="text-lg text-gray-700 mb-4">
                <strong>Matt:</strong> "Yeah man, sounds good! Maybe Thursday?"
              </p>
              <p className="text-lg text-gray-700 mb-4">
                <strong>Dave:</strong> "Actually, I have a work thing Thursday. How about Friday?"
              </p>
              <p className="text-lg text-gray-700 mb-4">
                <strong>Matt:</strong> "Friday's tough... let me check my calendar and get back to you."
              </p>
              <p className="text-lg text-gray-600 italic">
                <em>...three weeks later, they still haven't hung out.</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="bg-red-50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Sound Familiar?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">😤</div>
              <h4 className="text-xl font-semibold mb-3">Endless Group Chats</h4>
              <p className="text-gray-600">Back-and-forth messages that go nowhere. Everyone's "checking their calendar" but no one commits.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-xl font-semibold mb-3">Scheduling Hell</h4>
              <p className="text-gray-600">Trying to coordinate multiple busy schedules feels impossible. Plans fall through at the last minute.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">😔</div>
              <h4 className="text-xl font-semibold mb-3">Lost Friendships</h4>
              <p className="text-gray-600">You drift apart from friends because you can never actually make plans happen. Life gets busy, connections fade.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="bg-green-50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            BroYouFree Changes Everything
          </h3>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-3">Smart Availability</h4>
              <p className="text-gray-600">Everyone shares when they're free. The app finds the perfect time that works for the whole group automatically.</p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-3">Instant Coordination</h4>
              <p className="text-gray-600">No more endless back-and-forth. Get from "want to hang?" to confirmed plans in minutes, not weeks.</p>
            </div>
          </div>
          <div className="bg-blue-600 text-white rounded-lg p-8">
            <h4 className="text-2xl font-bold mb-4">Dave & Matt Now:</h4>
            <p className="text-lg">
              Dave opens BroYouFree, sees Matt is free Friday evening, sends a dinner invite. 
              Matt gets notified, confirms with one tap. Dinner is booked at 7 PM. 
              <strong> Total time: 30 seconds.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Never Miss Out Again?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of people who've already transformed their social lives. 
            Be the first to know when BroYouFree launches in your area.
          </p>
          
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
              </Button>
            </div>
          </form>
          
          <p className="text-sm text-gray-400 mt-4">
            No spam. We'll only email you when it's time to start making plans that actually happen.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <p className="mb-4">Already convinced?</p>
          <Button 
            onClick={() => navigate('/home')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Try the App Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
