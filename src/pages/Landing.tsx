
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Users, Calendar, MessageSquare, ArrowRight, ChevronDown, TrendingDown, Heart, AlertTriangle, Clock, Send, Activity, Target, Zap, X, CheckCircle, Star, Shield, Globe } from 'lucide-react';

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
          <div className="text-center animate-fade-in">
            {/* Brand Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-2xl shadow-2xl hover-scale">
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
                className="btn-hero-primary group hover-scale"
              >
                Try the App
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={() => scrollToSection('crisis')}
                className="btn-hero-secondary group hover-scale"
              >
                Learn More
                <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>

            {/* Feature Preview Icons */}
            <div className="flex justify-center gap-12 text-white/70">
              <div className="flex flex-col items-center gap-2 hover-scale">
                <MessageSquare className="w-8 h-8" />
                <span className="text-sm font-medium">Quick Invite</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover-scale">
                <Calendar className="w-8 h-8" />
                <span className="text-sm font-medium">Smart Scheduling</span>
              </div>
              <div className="flex flex-col items-center gap-2 hover-scale">
                <Users className="w-8 h-8" />
                <span className="text-sm font-medium">Group Coordination</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce cursor-pointer hover-scale" onClick={() => scrollToSection('crisis')}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Male Friendship Crisis Section */}
      <section id="crisis" className="bg-gradient-to-r from-red-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16 animate-fade-in">
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
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 hover-scale">
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

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all duration-300 hover-scale">
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

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-red-300 hover:shadow-md transition-all duration-300 hover-scale">
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
          <div className="bg-slate-800 text-white rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-3xl font-bold mb-4 text-white">The Devastating Health Impact</h4>
              <p className="text-xl text-slate-300 leading-relaxed max-w-4xl mx-auto">
                Men struggling with social isolation face serious health consequences that can't be ignored
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover-scale">
                <div className="text-2xl font-bold text-red-400 mb-2">3x Higher Risk</div>
                <p className="text-lg text-slate-200">Depression and mental health issues</p>
              </div>
              <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover-scale">
                <div className="text-2xl font-bold text-red-400 mb-2">Increased Risk</div>
                <p className="text-lg text-slate-200">Heart disease and early death</p>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xl font-semibold text-slate-200">
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
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 text-left shadow-inner border border-gray-100 hover-scale">
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
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive hover-scale">
              <div className="flex items-center justify-center mb-4">
                <MessageSquare className="w-12 h-12 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Endless Group Chats</h4>
              <p className="text-gray-600 leading-relaxed">Back-and-forth messages that go nowhere. Everyone's "checking their calendar" but no one commits.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive hover-scale">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Scheduling Hell</h4>
              <p className="text-gray-600 leading-relaxed">Trying to coordinate multiple busy schedules feels impossible. Plans fall through at the last minute.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 card-interactive hover-scale">
              <div className="flex items-center justify-center mb-4">
                <AlertTriangle className="w-12 h-12 text-gray-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-gray-800">Lost Friendships</h4>
              <p className="text-gray-600 leading-relaxed">You drift apart from friends because you can never actually make plans happen. Life gets busy, connections fade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="bg-gradient-to-r from-green-50 to-emerald-50 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              BroYouFree Changes Everything
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From "we should hang out" to confirmed plans in just 3 taps. 
              The coordination system built for how men actually communicate.
            </p>
          </div>

          {/* 3-Tap System Visual Flow */}
          <div className="mb-16">
            <h4 className="text-2xl font-bold text-center text-gray-800 mb-8">The 3-Tap System</h4>
            <div className="grid md:grid-cols-4 gap-6 items-center">
              {/* Step 1 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200 text-center hover:shadow-xl transition-all duration-300 hover-scale">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">1. Pick Friends</h5>
                <p className="text-gray-600 text-sm">Select who you want to hang with</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200 text-center hover:shadow-xl transition-all duration-300 hover-scale">
                <div className="bg-teal-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-teal-600" />
                </div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">2. Find Time</h5>
                <p className="text-gray-600 text-sm">Auto-match everyone's availability</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-8 h-8 text-green-600" />
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200 text-center hover:shadow-xl transition-all duration-300 hover-scale">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h5 className="text-lg font-semibold text-gray-800 mb-2">3. Send Invite</h5>
                <p className="text-gray-600 text-sm">One tap sends the plan to everyone</p>
              </div>
            </div>
          </div>

          {/* Core Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Quick Coordination</h4>
                  <p className="text-gray-600 leading-relaxed">No more endless group chats. Smart algorithms find the perfect time that works for everyone automatically.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-teal-50 p-3 rounded-lg">
                  <Activity className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Activity-First Planning</h4>
                  <p className="text-gray-600 leading-relaxed">Start with what you want to do, not when you're free. Built for spontaneous hangouts and planned adventures.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-green-50 p-3 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Smart Scheduling</h4>
                  <p className="text-gray-600 leading-relaxed">Integrates with your calendar to automatically suggest optimal times when the whole group is available.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Masculine Communication</h4>
                  <p className="text-gray-600 leading-relaxed">Direct, efficient messaging designed for how men actually communicate. No overthinking, just results.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dave & Matt Transformation */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <h4 className="text-3xl font-bold mb-4">Dave & Matt Now</h4>
              <p className="text-xl text-blue-100 leading-relaxed max-w-4xl mx-auto">
                See how the 3-tap system transforms their coordination
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Before */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover-scale">
                <div className="text-lg font-semibold text-blue-200 mb-3">Before BroYouFree</div>
                <div className="space-y-2 text-sm text-blue-100">
                  <p>"Want to grab dinner this week?"</p>
                  <p>"Maybe Thursday?"</p>
                  <p>"Actually, I have work..."</p>
                  <p>"Let me check my calendar..."</p>
                  <div className="text-red-300 font-medium mt-3">3 weeks later: still no dinner</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-center">
                <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold text-sm mx-auto inline-block">
                  3-Tap System
                </div>
                <ArrowRight className="w-12 h-12 text-yellow-400 mx-auto mt-4" />
              </div>

              {/* After */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover-scale">
                <div className="text-lg font-semibold text-green-300 mb-3">With BroYouFree</div>
                <div className="space-y-2 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Dave picks Matt as friend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>App finds Friday 7 PM works</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Sends dinner invite instantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Matt confirms with one tap</span>
                  </div>
                  <div className="text-green-300 font-medium mt-3">Total time: 30 seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section id="market" className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Target className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Massive Market Opportunity
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              We're targeting the largest underserved demographic in social coordination
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50M+</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Addressable Market</div>
                <p className="text-slate-700 leading-relaxed">
                  Men aged 25-50 in the US struggling with social coordination and friendship maintenance
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">$2.4B</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Market Size</div>
                <p className="text-slate-700 leading-relaxed">
                  Annual spending on social activities and coordination tools by our target demographic
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Direct Competitors</div>
                <p className="text-slate-700 leading-relaxed">
                  No existing solution specifically designed for male friendship coordination
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-10 shadow-xl">
            <div className="text-center">
              <h4 className="text-3xl font-bold mb-4">Prime Target Demographics</h4>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover-scale">
                  <h5 className="text-xl font-semibold mb-4 text-blue-200">Primary Market</h5>
                  <ul className="text-blue-100 space-y-2 text-left">
                    <li>• Men aged 25-40: Career-focused, time-constrained</li>
                    <li>• High disposable income, value efficiency</li>
                    <li>• Active social lives but struggle with coordination</li>
                    <li>• Tech-savvy early adopters</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 hover-scale">
                  <h5 className="text-xl font-semibold mb-4 text-blue-200">Secondary Market</h5>
                  <ul className="text-blue-100 space-y-2 text-left">
                    <li>• Men aged 40-50: Established careers, families</li>
                    <li>• Want to maintain friendships despite busy lives</li>
                    <li>• Value quality time over quantity</li>
                    <li>• Willing to pay for premium solutions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Existing Solutions Fail Section */}
      <section id="competitive" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <X className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Existing Solutions Fail
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Current tools weren't built for how men actually coordinate social activities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-50 p-3 rounded-lg">
                  <Calendar className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Calendly & Scheduling Apps</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Too formal for casual hangouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Designed for business meetings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">No group coordination features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Lacks activity planning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Group Chats</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Endless back-and-forth messaging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Plans get lost in conversation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">No commitment mechanism</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Information overload</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover-scale">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2 text-gray-800">Meetup & Social Apps</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Focus on meeting strangers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Not for existing friend groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Overly complicated interfaces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-sm">No private coordination</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <h4 className="text-3xl font-bold mb-4">BroYouFree Solves All These Problems</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">Built specifically for friend coordination</span>
                </div>
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">Eliminates endless group chat loops</span>
                </div>
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">3-tap system: fast and efficient</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">Activity-first planning approach</span>
                </div>
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">Smart group availability matching</span>
                </div>
                <div className="flex items-center gap-3 hover-scale">
                  <CheckCircle className="w-6 h-6 text-green-200" />
                  <span className="text-green-100">Designed for masculine communication</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Male Psychology Section */}
      <section id="psychology" className="bg-gradient-to-r from-slate-50 to-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Zap className="w-12 h-12 text-slate-700" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Male Psychology
            </h3>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Understanding how men communicate and coordinate is at the core of our design
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover-scale">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">Direct Communication</h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Men prefer clear, purpose-driven communication. Our interface eliminates small talk and gets straight to planning.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">"Want to grab dinner Friday?" → Instant availability check → Done.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover-scale">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">Action-Oriented</h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Men think in terms of activities first, then logistics. Our flow mirrors this natural thought process.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-medium">Activity → Who → When → Confirmed</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover-scale">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">Efficiency Over Emotion</h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  No endless deliberation or over-analysis. Quick decisions, clear outcomes, solid commitments.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-medium">3 taps. 30 seconds. Plans made.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 hover-scale">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">Low-Pressure Environment</h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  No awkward "what do you want to do?" conversations. The app handles coordination, you handle the fun.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-medium">Remove friction, maintain friendship.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-gray-800 text-white rounded-2xl p-10 shadow-xl">
            <div className="text-center mb-8">
              <h4 className="text-3xl font-bold mb-4">The Science Behind Our Approach</h4>
              <p className="text-xl text-slate-300 leading-relaxed max-w-4xl mx-auto">
                Research shows men thrive with structured, goal-oriented social coordination
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 text-center hover-scale">
                <div className="text-2xl font-bold text-blue-400 mb-2">85%</div>
                <p className="text-slate-200">of men prefer activity-based social planning</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 text-center hover-scale">
                <div className="text-2xl font-bold text-green-400 mb-2">3x</div>
                <p className="text-slate-200">more likely to follow through with structured plans</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 text-center hover-scale">
                <div className="text-2xl font-bold text-purple-400 mb-2">70%</div>
                <p className="text-slate-200">reduction in coordination stress with clear systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section id="cta" className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center relative z-10">
          {/* Social Proof */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-300" />
                <span className="text-blue-200 font-medium">2,847 beta users</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-300" />
                <span className="text-green-200 font-medium">Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200 font-medium">12 cities launching</span>
              </div>
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
              <span className="text-slate-300 ml-2">4.9/5 from early access users</span>
            </div>
          </div>

          {/* Main CTA Content */}
          <div className="mb-12 animate-scale-in">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Join the Friendship Revolution
            </h3>
            <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              Be among the first to experience effortless coordination
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Limited early access launching in select markets. Reserve your spot and never miss out on quality time with friends again.
            </p>
          </div>
          
          {/* Premium Email Form */}
          <div className="max-w-lg mx-auto mb-12">
            <form onSubmit={handleEmailSubmit} className="relative group">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 rounded-2xl px-6 pr-40 text-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 rounded-xl font-semibold text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Get Early Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
            
            {/* Form Benefits */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Priority beta access</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Exclusive features</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Founding member perks</span>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto mb-12 hover-scale">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MK</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Michael K.</div>
                <div className="text-slate-400 text-sm">Beta User, San Francisco</div>
              </div>
            </div>
            <p className="text-slate-200 italic leading-relaxed">
              "Finally, a way to actually hang out with my friends without the endless 'what works for everyone' back-and-forth. 
              We've had more quality time together in the past month than we did all last year."
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-4">
              Trusted by professionals at leading companies
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <div className="text-slate-500 font-semibold">Google</div>
              <div className="text-slate-500 font-semibold">Meta</div>
              <div className="text-slate-500 font-semibold">Apple</div>
              <div className="text-slate-500 font-semibold">Netflix</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BroYouFree</span>
              </div>
              <p className="text-slate-500">Making friendship coordination effortless.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/home')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-scale"
              >
                Try the Demo
              </Button>
              <Button 
                onClick={() => scrollToSection('cta')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
              >
                Get Early Access
              </Button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            <p>&copy; 2024 BroYouFree. All rights reserved. Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
