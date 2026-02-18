import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Password updated successfully!');
        navigate('/home', { replace: true });
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
              🔒
            </div>
            <CardTitle className="typo-headline-lg text-primary-navy">
              Set New Password
            </CardTitle>
            <p className="typo-body text-brand-secondary mt-bro-sm">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-bro-lg">
              <div className="space-y-bro-md">
                <Input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="h-12 text-base border-primary-navy/20 focus:border-accent-orange focus:ring-accent-orange/20 bg-white/80 backdrop-blur-sm"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
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
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
