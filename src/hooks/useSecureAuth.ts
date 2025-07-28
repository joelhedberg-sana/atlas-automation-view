import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSecurity } from './useSecurity';

export function useSecureAuth() {
  const { user } = useAuth();
  const { trackFailedLogin, checkAccountLock, logSecurityEvent, createUserSession } = useSecurity();
  const [loading, setLoading] = useState(false);

  const secureSignIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Check if account is locked before attempting sign in
      const isLocked = await checkAccountLock(email);
      if (isLocked) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Track failed login attempt
        await trackFailedLogin(email, error.message);
        throw error;
      }

      if (data.user) {
        // Log successful login
        await logSecurityEvent('user_login', {
          email,
          login_method: 'password',
          user_id: data.user.id
        });

        // Create session tracking
        if (data.session) {
          await createUserSession(data.session.access_token);
        }
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const secureSignUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata
        }
      });

      if (error) throw error;

      if (data.user) {
        // Log user registration
        await logSecurityEvent('user_registration', {
          email,
          user_id: data.user.id,
          metadata
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const secureSignOut = async () => {
    setLoading(true);
    
    try {
      if (user) {
        // Log logout event
        await logSecurityEvent('user_logout', {
          user_id: user.id,
          email: user.email
        });
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      // Log password reset request
      await logSecurityEvent('password_reset_requested', {
        email
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      if (user) {
        // Log password change
        await logSecurityEvent('password_changed', {
          user_id: user.id,
          email: user.email
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const enableMFA = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      
      if (error) throw error;

      if (user) {
        // Log MFA enablement
        await logSecurityEvent('mfa_enabled', {
          user_id: user.id,
          email: user.email,
          factor_id: data?.id
        });
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async (factorId: string, challengeId: string, code: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });

      if (error) throw error;

      if (user) {
        // Log successful MFA verification
        await logSecurityEvent('mfa_verified', {
          user_id: user.id,
          email: user.email,
          factor_id: factorId
        });
      }

      return { data, error: null };
    } catch (error: any) {
      // Log failed MFA attempt
      if (user) {
        await logSecurityEvent('mfa_failed', {
          user_id: user.id,
          email: user.email,
          factor_id: factorId,
          error: error.message
        });
      }
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    secureSignIn,
    secureSignUp,
    secureSignOut,
    resetPassword,
    updatePassword,
    enableMFA,
    verifyMFA
  };
}