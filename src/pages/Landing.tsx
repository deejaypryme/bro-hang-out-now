import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Users, Calendar, MessageSquare, ArrowRight, ChevronDown, TrendingDown, Heart, AlertTriangle } from 'lucide-react';

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Hero Section */}
      <section id="hero" className="hero-background min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 relative z-10">
          <div className="text-center">
            {/* Brand Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-2xl shadow-2xl">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            
            {/* Brand Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
              BroYouFree
            </h1>
            
            {/* Main Tagline */}
            <h2 className="hero-title mb-6">
              Because Friends Matter<br />and So Do You
            </h2>
            
            {/* Hero Subtitle */}
            <p className="hero-subtitle mb-12 max-w-3xl mx-auto">
              Transform "we should hang out" into confirmed plans. 
              The friendship coordination app built for how men actually communicate.
            </p>
            
            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button 
                onClick={() => navigate('/home')}
                className="btn-hero-primary group"
              >
                Try the App
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => scrollToSection('crisis')}
                className="btn-hero-secondary group"
              >
                Learn More
                <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>

            {/* Feature Preview Icons */}
            <div className="flex justify-center gap-12 text-white/70">
              <div className="flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8" />
                <span className="text-sm font-medium">Quick Invite</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Calendar className="w-8 h-8" />
                <span className="text-sm font-medium">Smart Scheduling</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="w-8 h-8" />
                <span className="text-sm font-medium">Group Coordination</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce cursor-pointer" onClick={() => scrollToSection('crisis')}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Male Friendship Crisis Section */}
      <section id="crisis" className="bg-gradient-to-r from-red-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Male Friendship Crisis
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We're facing an epidemic of male loneliness that's destroying friendships and threatening men's health
            </p>
          </div>

          {/* Key Statistics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <TrendingDown className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-blue-600 mb-1">75%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">OF MEN AGED 30-55</div>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-base leading-relaxed">
                Want to spend more time with friends but can't overcome the coordination barrier
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-teal-50 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-teal-600 mb-1">2</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CLOSE FRIENDS</div>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-base leading-relaxed">
                Average number of close male friends (down from 6+ in 1990)
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-red-600 mb-1">15%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">OF MEN</div>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-base leading-relaxed">
                Have no close friends at all (up from 3% in 1990)
              </p>
            </div>
          </div>

          {/* Health Consequences */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-red-200 mx-auto mb-4" />
              <h4 className="text-3xl font-bold mb-4">The Devastating Health Impact</h4>
              <p className="text-xl text-red-100 leading-relaxed max-w-4xl mx-auto">
                Men struggling with social isolation face serious health consequences that can't be ignored
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="text-2xl font-bold text-red-200 mb-2">3x Higher Risk</div>
                <p className="text-lg text-white">Depression and mental health issues</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="text-2xl font-bold text-red-200 mb-2">Increased Risk</div>
                <p className="text-lg text-white">Heart disease and early death</p>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xl font-semibold text-red-100">
                "Scheduling" and "life busyness" are the #1 barriers preventing men from maintaining friendships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dave & Matt Story Section */}
      <section id="story" className="bg-white py-16 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 animate-slide-up">
              Meet Dave & Matt
            </h3>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 text-left shadow-inner border border-gray-100">
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  <strong className="text-blue-600">Dave:</strong> "Hey Matt, want to grab dinner this week?"
                </p>
                <p className="text-lg text-gray-700">
                  <strong className="text-green-600">Matt:</strong> "Yeah man, sounds good! Maybe Thursday?"
                </p>
                <p className="text-lg text-gray-700">
                  <strong className="text-blue-600">Dave:</strong> "Actually, I have a work thing Thursday. How about Friday?"
                </p>
                <p className="text-lg text-gray-700">
                  <strong className="text-green-600">Matt:</strong> "Friday's tough... let me check my calendar and get back to you."
                </p>
                <div className="border-l-4 border-orange-400 pl-4 bg-orange-50 rounded-r-lg py-2">
                  <p className="text-lg text-gray-600 italic font-medium">
                    ...three weeks later, they still haven't hung out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Sound Familiar?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive">
              <div className="text-5xl mb-4">😤</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Endless Group Chats</h4>
              <p className="text-gray-600 leading-relaxed">Back-and-forth messages that go nowhere. Everyone's "checking their calendar" but no one commits.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive">
              <div className="text-5xl mb-4">📅</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Scheduling Hell</h4>
              <p className="text-gray-600 leading-relaxed">Trying to coordinate multiple busy schedules feels impossible. Plans fall through at the last minute.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive">
              <div className="text-5xl mb-4">😔</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Lost Friendships</h4>
              <p className="text-gray-600 leading-relaxed">You drift apart from friends because you can never actually make plans happen. Life gets busy, connections fade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            BroYouFree Changes Everything
          </h3>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-5xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Smart Availability</h4>
              <p className="text-gray-600 leading-relaxed">Everyone shares when they're free. The app finds the perfect time that works for the whole group automatically.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-5xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Instant Coordination</h4>
              <p className="text-gray-600 leading-relaxed">No more endless back-and-forth. Get from "want to hang?" to confirmed plans in minutes, not weeks.</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 shadow-xl">
            <h4 className="text-2xl font-bold mb-4">Dave & Matt Now:</h4>
            <p className="text-lg leading-relaxed">
              Dave opens BroYouFree, sees Matt is free Friday evening, sends a dinner invite. 
              Matt gets notified, confirms with one tap. Dinner is booked at 7 PM. 
              <strong className="text-yellow-300"> Total time: 30 seconds.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Never Miss Out Again?
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
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
                className="flex-1 bg-white text-gray-900 border-0 shadow-lg focus:ring-2 focus:ring-blue-400"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
              </Button>
            </div>
          </form>
          
          <p className="text-sm text-gray-400 mt-4">
            No spam. We'll only email you when it's time to start making plans that actually happen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <p className="mb-4">Already convinced?</p>
          <Button 
            onClick={() => navigate('/home')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300"
          >
            Try the App Now
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
