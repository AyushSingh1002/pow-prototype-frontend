'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/auth/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const finishSignIn = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/');
        return;
      }
      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      const timeout = window.setTimeout(() => {
        setError('The sign-in link is invalid or has expired. Please request a new link.');
      }, 2500);
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          window.clearTimeout(timeout);
          authListener.subscription.unsubscribe();
          router.replace('/');
        }
      });
    };

    void finishSignIn();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="proof-sheet border-2 border-[#0F1218] bg-white p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <h1 className="text-xl font-bold">Sign-in could not be completed</h1>
            <p className="mt-3 text-sm text-[#C4161C]">{error}</p>
            <button className="btn-proof-primary mt-5" onClick={() => router.replace('/')}>
              Return home
            </button>
          </>
        ) : (
          <p className="font-semibold">Completing secure sign-in...</p>
        )}
      </div>
    </main>
  );
}
