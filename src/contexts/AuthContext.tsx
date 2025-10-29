
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/database';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔐 [AuthProvider] Initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile independently when user changes
  useEffect(() => {
    if (user?.id) {
      console.log('👤 [AuthProvider] Loading user profile...');
      profileService.getProfile(user.id)
        .then(userProfile => {
          console.log('✅ [AuthProvider] Profile loaded successfully');
          setProfile(userProfile);
        })
        .catch(error => {
          console.error('❌ [AuthProvider] Error loading profile:', error);
        });
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  useEffect(() => {
    console.log('🔐 [AuthProvider] Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 [AuthProvider] Auth state changed:', event, !!session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 [AuthProvider] Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🔐 [AuthProvider] Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('🔐 [AuthProvider] Signing up user...');
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    if (error) {
      console.error('❌ [AuthProvider] Sign up error:', error);
    } else {
      console.log('✅ [AuthProvider] Sign up successful');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthProvider] Signing in user...');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ [AuthProvider] Sign in error:', error);
    } else {
      console.log('✅ [AuthProvider] Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('🔐 [AuthProvider] Signing out user...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ [AuthProvider] Sign out error:', error);
    } else {
      console.log('✅ [AuthProvider] Sign out successful');
    }
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  };

  console.log('🔐 [AuthProvider] Rendering with state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    hasProfile: !!profile, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
