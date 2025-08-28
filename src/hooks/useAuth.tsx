import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signUp: (phoneNumber: string, displayName: string, preferredChannel: 'sms' | 'telegram') => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendOTP: (phoneNumber: string, channel: 'sms' | 'telegram') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              setProfile(profileData);
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (phoneNumber: string, displayName: string, preferredChannel: 'sms' | 'telegram') => {
    try {
      // Clean up any existing auth state
      await cleanupAuthState();
      
      // Call the signup edge function
      const { data, error } = await supabase.functions.invoke('auth-signup', {
        body: {
          phoneNumber,
          displayName,
          preferredChannel
        }
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: `Verification code sent via ${preferredChannel}`,
      });
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      // Call the verify OTP edge function
      const { data, error } = await supabase.functions.invoke('auth-verify-otp', {
        body: {
          phoneNumber,
          otp
        }
      });

      if (error) throw error;

      // The auth state change will be handled by the listener
      toast({
        title: "Login Successful",
        description: "Welcome to Yegebere Gebeya!",
      });

      // Navigate to main app instead of forcing reload
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resendOTP = async (phoneNumber: string, channel: 'sms' | 'telegram') => {
    try {
      const { error } = await supabase.functions.invoke('auth-resend-otp', {
        body: {
          phoneNumber,
          channel
        }
      });

      if (error) throw error;

      toast({
        title: "OTP Resent",
        description: `New verification code sent via ${channel}`,
      });
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend OTP",
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Force cleanup even if signOut fails
      window.location.href = '/auth';
    }
  };

  const cleanupAuthState = async () => {
    try {
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Remove from sessionStorage if in use
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cleanup auth state error:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    verifyOTP,
    signOut,
    resendOTP
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}