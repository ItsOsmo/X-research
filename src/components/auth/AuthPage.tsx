import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';
import ResearchSignIn from '@/components/ui/research-signin';

interface AuthPageProps {
  onBack?: () => void;
  onAuthSuccess?: (user: User) => void;
}

const AuthPage = ({ onBack, onAuthSuccess }: AuthPageProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Don't auto-redirect when on auth page - let users sign out or switch accounts
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const signInWithEmail = async (e: React.FormEvent | null, emailParam?: string, passwordParam?: string) => {
    e?.preventDefault();
    setLoading(true);

    const emailToUse = emailParam || email;
    const passwordToUse = passwordParam || password;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: passwordToUse,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('Successfully signed in!');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (e: React.FormEvent | null, emailParam?: string, passwordParam?: string, nameParam?: string) => {
    e?.preventDefault();
    setLoading(true);

    const nameToUse = nameParam || name;
    const emailToUse = emailParam || email;
    const passwordToUse = passwordParam || password;

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: emailToUse,
        password: passwordToUse,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: nameToUse,
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Successfully signed up! Please check your email for verification.");
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        <ResearchSignIn
          mode={mode}
          onModeChange={setMode}
          onSignIn={async (name, email, password) => {
            setName(name);
            setEmail(email);
            setPassword(password);

            if (mode === 'signUp') {
              await signUpWithEmail(null, email, password, name);
            } else {
              await signInWithEmail(null, email, password);
            }
          }}
          onGoogleSignIn={signInWithGoogle}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AuthPage;