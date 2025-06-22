
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Check your email to verify your account.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/home');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-background flex items-center justify-center p-bro-lg">
      <div className="w-full max-w-md">
        <Card variant="glass" className="shadow-2xl border-white/20">
          <CardHeader className="text-center pb-bro-lg">
            <div className="w-16 h-16 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-3xl text-white mx-auto mb-bro-lg shadow-lg">
              👊
            </div>
            <CardTitle className="typo-headline-lg text-primary-navy">
              {isSignUp ? 'Join BroYouFree' : 'Welcome Back'}
            </CardTitle>
            <p className="typo-body text-brand-secondary mt-bro-sm">
              {isSignUp 
                ? 'Create your account to start hanging with friends' 
                : 'Sign in to your BroYouFree account'
              }
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-bro-lg">
              <div className="space-y-bro-md">
                {isSignUp && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <Button 
                type="submit" 
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="mt-bro-xl text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="typo-body text-brand-accent hover:text-accent-light font-semibold transition-colors duration-200"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
