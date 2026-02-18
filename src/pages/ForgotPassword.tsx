import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success('Check your email for a password reset link');
      }
    } catch {
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
              🔑
            </div>
            <CardTitle className="typo-headline-lg text-primary-navy">
              {sent ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <p className="typo-body text-brand-secondary mt-bro-sm">
              {sent
                ? 'We sent a password reset link to your email'
                : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {sent ? (
              <div className="text-center space-y-bro-lg">
                <p className="typo-body text-brand-secondary">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button variant="outline" onClick={() => setSent(false)} className="w-full">
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-bro-lg">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
            <div className="mt-bro-xl text-center">
              <Link
                to="/login"
                className="text-brand-accent hover:text-accent-light font-semibold transition-colors duration-200"
              >
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
