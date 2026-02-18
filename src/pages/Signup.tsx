
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Auto-suggest username from email
  useEffect(() => {
    if (email && !username) {
      const prefix = email.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') || '';
      if (prefix) setUsername(prefix);
    }
  }, [email]);

  const validateForm = () => {
    if (!email || !password || !fullName || !confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await signUp(email, password, { full_name: fullName, username: username || undefined });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Check your email to verify your account.');
        navigate('/login');
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
              Join BroYouFree
            </CardTitle>
            <p className="typo-body text-brand-secondary mt-bro-sm">
              Create your account to start hanging with friends
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-bro-lg">
              <div className="space-y-bro-md">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    autoComplete="username"
                    className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                  />
                  <p className="typo-mono text-brand-muted mt-bro-xs text-xs">
                    Letters, numbers, and underscores only
                  </p>
                </div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                  />
                  <p className="typo-mono text-brand-muted mt-bro-xs text-xs">
                    Min 6 characters
                  </p>
                </div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
            
            <div className="mt-bro-xl text-center">
              <p className="typo-body text-brand-secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-brand-accent hover:text-accent-light font-semibold transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
