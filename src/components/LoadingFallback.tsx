
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, Users } from 'lucide-react';

interface LoadingFallbackProps {
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  isLoading = false,
  error = null,
  onRetry,
  title = "Loading...",
  description = "Please wait while we load your data.",
  icon = <Users className="w-16 h-16 text-accent-orange" />
}) => {
  console.log('🔄 [LoadingFallback] Rendering:', { isLoading, hasError: !!error });

  if (error) {
    console.error('❌ [LoadingFallback] Displaying error:', error);
    
    return (
      <Card variant="glass" className="shadow-xl border-red-200">
        <CardContent className="text-center py-bro-4xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-bro-lg" />
          <h3 className="typo-title-lg text-red-600 mb-bro-sm">Something went wrong</h3>
          <p className="typo-body text-text-secondary mb-bro-lg">
            {error.message || 'An unexpected error occurred while loading your data.'}
          </p>
          <div className="space-y-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            <p className="typo-mono text-text-muted text-xs">
              If this problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    console.log('⏳ [LoadingFallback] Displaying loading state');
    
    return (
      <Card variant="glass" className="shadow-xl border-white/20">
        <CardContent className="text-center py-bro-4xl">
          <div className="w-12 h-12 bg-gradient-to-r from-accent-orange to-accent-light rounded-bro-lg flex items-center justify-center text-2xl text-white mx-auto mb-bro-lg animate-pulse shadow-lg">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="typo-title-lg text-primary-navy mb-bro-sm">{title}</h3>
          <p className="typo-body text-text-secondary">{description}</p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

// Specialized loading components for different sections
export const FriendsLoadingFallback: React.FC<Omit<LoadingFallbackProps, 'title' | 'description' | 'icon'>> = (props) => (
  <LoadingFallback
    {...props}
    title="Loading Friends"
    description="Fetching your friends list and their current status..."
    icon={<Users className="w-16 h-16 text-accent-orange" />}
  />
);

export const InvitationsLoadingFallback: React.FC<Omit<LoadingFallbackProps, 'title' | 'description' | 'icon'>> = (props) => (
  <LoadingFallback
    {...props}
    title="Loading Invitations"
    description="Checking for new friend invitations..."
    icon={<Users className="w-16 h-16 text-accent-orange" />}
  />
);

export default LoadingFallback;
