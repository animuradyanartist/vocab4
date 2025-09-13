import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  email: string;
  uid: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guard against Supabase not being configured
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          email: session.user.email || '',
          uid: session.user.id
        });
        
        // Update or create user profile
        supabase
          .from('user_profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email || '',
            last_sign_in_at: new Date().toISOString()
          })
          .then(({ error }) => {
            if (error) console.error('Error updating user profile:', error);
          });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            uid: session.user.id
          });
          
          // Update user profile on sign in
          if (event === 'SIGNED_IN') {
            supabase
              .from('user_profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email || '',
                last_sign_in_at: new Date().toISOString()
              })
              .then(({ error }) => {
                if (error) console.error('Error updating user profile:', error);
              });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Supabase is configured before attempting login
      if (!isSupabaseConfigured || !supabase) {
        const errorMessage = 'Database connection not configured. Please set up Supabase.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = getErrorMessage(error.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle specific network errors
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = 'Network error: Unable to connect to authentication service. Please check your internet connection and try again.';
      } else if (err.message?.includes('NetworkError')) {
        errorMessage = 'Network error: Please check your internet connection.';
      } else if (err.message) {
        errorMessage = `Connection error: ${err.message}`;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if Supabase is configured before attempting signup
      if (!isSupabaseConfigured || !supabase) {
        const errorMessage = 'Database connection not configured. Please set up Supabase.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        const errorMessage = getErrorMessage(error.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle specific network errors
      if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        errorMessage = 'Network error: Unable to connect to authentication service. Please check your internet connection and try again.';
      } else if (err.message?.includes('NetworkError')) {
        errorMessage = 'Network error: Please check your internet connection.';
      } else if (err.message) {
        errorMessage = `Connection error: ${err.message}`;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const errorMessage = getErrorMessage(error.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        const errorMessage = getErrorMessage(error.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'Password should be at least 6 characters long.';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('Too many requests')) {
      return 'Too many failed attempts. Please try again later.';
    }
    return errorMessage || 'An error occurred. Please try again.';
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
    resetPassword,
    updatePassword
  };
};