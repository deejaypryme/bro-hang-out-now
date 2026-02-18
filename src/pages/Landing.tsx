
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen hero-background">
      {/* Header */}
      <header className="glass-surface border-b border-white/20">
        <div className="max-w-6xl mx-auto px-bro-lg md:px-bro-xl py-bro-lg flex items-center justify-between">
          <div className="flex items-center gap-bro-md">
            <div className="w-10 h-10 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-xl text-white shadow-lg">
              👊
            </div>
            <h1 className="typo-title-lg text-primary-navy">BroYouFree</h1>
          </div>
          <div className="flex items-center gap-bro-md">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-text-secondary hover:text-primary-navy">
              Sign In
            </Button>
            <Button variant="primary" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-bro-lg md:px-bro-xl py-bro-5xl text-center">
        <div className="text-8xl mb-bro-xl animate-bounce">👊</div>
        <h2 className="typo-display text-primary-navy mb-bro-lg max-w-3xl mx-auto">
          Turn "we should hang out" into actual plans
        </h2>
        <p className="typo-body-large text-text-secondary max-w-xl mx-auto mb-bro-2xl">
          Coordinate hangouts with friends in 3 taps. No more "when are you free?" back-and-forth texts.
        </p>
        <div className="flex flex-col sm:flex-row gap-bro-md justify-center">
          <Button variant="primary" size="lg" onClick={() => navigate('/signup')} className="shadow-xl text-lg px-8">
            Start For Free
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
            I Have an Account
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-bro-lg md:px-bro-xl pb-bro-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-bro-xl">
          {[
            { icon: Users, title: 'Add Your Crew', desc: 'Find and add friends by email or username' },
            { icon: Calendar, title: 'Pick a Time', desc: 'Choose when works for you with smart scheduling' },
            { icon: Zap, title: 'Send the Invite', desc: '"Bro You Free?" — one tap to send a hangout invite' },
            { icon: Clock, title: 'Track Everything', desc: 'See upcoming hangouts, streaks, and bro points' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-bro-xl text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center mx-auto mb-bro-lg">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="typo-title-md mb-bro-sm">{title}</h3>
              <p className="typo-body text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-surface border-t border-white/20 py-bro-4xl text-center">
        <h3 className="typo-headline-lg text-primary-navy mb-bro-md">Ready to hang?</h3>
        <p className="typo-body text-text-secondary mb-bro-xl">Join BroYouFree and never miss a hangout again.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/signup')} className="shadow-xl">
          Create Your Account
        </Button>
      </section>
    </div>
  );
};

export default Landing;
