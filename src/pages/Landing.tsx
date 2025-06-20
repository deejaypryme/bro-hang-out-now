
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShapeLandingHero } from '@/components/ui/shape-landing-hero';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to home if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: '📱',
      title: 'Simple Invites',
      description: 'Send "Bro You Free?" invites in just 3 taps'
    },
    {
      icon: '⏰',
      title: 'Smart Scheduling',
      description: 'Find the perfect time that works for everyone'
    },
    {
      icon: '🎯',
      title: 'Activity Matching',
      description: 'Discover activities you and your friends will love'
    },
    {
      icon: '📊',
      title: 'Friendship Stats',
      description: 'Track your social life with Bro Points and streaks'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <ShapeLandingHero />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white mx-auto mb-8 shadow-lg">
            👊
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700">
            BroYouFree?
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Turn "we should hang out" into actual plans. The app that makes hanging with friends as easy as sending a text.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/home')}
              className="border-gray-300 bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            Why BroYouFree Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-800">
            Three Taps to Hangout
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">1</div>
              <h3 className="text-xl font-semibold text-gray-800">Pick a Friend</h3>
              <p className="text-gray-600">Select who you want to hang with from your friends list</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">2</div>
              <h3 className="text-xl font-semibold text-gray-800">Choose Times</h3>
              <p className="text-gray-600">Share when you're free and find the perfect match</p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">3</div>
              <h3 className="text-xl font-semibold text-gray-800">Plan Activity</h3>
              <p className="text-gray-600">Pick what you want to do and make it happen</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Ready to Hang More?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands who've turned social plans from "maybe" to "definitely"
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg"
          >
            Start Hanging Out
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
