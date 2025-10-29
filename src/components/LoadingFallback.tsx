
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

// Skeleton Loaders for specific pages
export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-bro-lg md:gap-bro-xl mb-bro-2xl px-bro-lg md:px-bro-xl">
    {[1, 2, 3].map((i) => (
      <Card key={i} variant="glass" className="shadow-2xl border-white/20">
        <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-lg">
          <Skeleton className="w-10 h-10 rounded-bro-lg" />
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-bro-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const FriendCardsSkeleton = () => (
  <div className="grid gap-bro-md md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} variant="glass" className="shadow-xl">
        <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-md">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-bro-xs">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-bro-sm">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const CalendarSkeleton = () => (
  <div className="space-y-bro-lg">
    <div className="flex items-center justify-between mb-bro-md">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-bro-sm">
        <Skeleton className="h-8 w-8 rounded-bro-md" />
        <Skeleton className="h-8 w-8 rounded-bro-md" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-bro-xs">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-bro-md" />
      ))}
    </div>
  </div>
);

export const InvitePageSkeleton = () => (
  <div className="max-w-4xl mx-auto py-bro-xl px-bro-lg space-y-bro-xl">
    <div>
      <Skeleton className="h-8 w-48 mb-bro-lg" />
      <div className="grid gap-bro-md md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} variant="glass">
            <CardHeader className="flex flex-row items-center gap-bro-md pb-bro-md">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-bro-xs">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-bro-xs">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-8 w-full rounded-bro-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingFallback;
