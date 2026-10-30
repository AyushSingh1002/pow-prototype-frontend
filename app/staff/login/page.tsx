'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaff } from '../../../context/StaffContext';

export default function StaffLoginPage() {
  const { session, isDemoMode, authError, enterDemo, signInWithEmailOtp } = useStaff();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(authError);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  useEffect(() => {
    if (session) router.replace('/staff');
  }, [router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signInWithEmailOtp(email);
      setNotice('Check your inbox for the staff sign-in link.');
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Staff sign-in failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <Link className="btn-proof-link min-h-11" href="/">Storefront</Link>
      <section className="proof-sheet mt-8 p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5A6070]">Press &amp; Proof / Staff</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Production desk</h1>
        <p className="reading-text-soft mt-4">
          Sign in with an authorized staff account to claim and fulfill print jobs.
        </p>
        {isDemoMode ? (
          <div className="mt-6">
            <p className="text-sm text-[#5A6070]">Demo identity: Demo Staff · staff</p>
            <button className="btn-proof-primary mt-4 min-h-11" onClick={enterDemo} type="button">
              Enter demo staff workspace
            </button>
          </div>
        ) : (
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="staff-email">Staff email</label>
            <input
              className="min-w-0 min-h-11 flex-1 border border-[#5A6070] bg-white px-3"
              id="staff-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@company.com"
            />
            <button className="btn-proof-primary min-h-11" disabled={busy} type="submit">
              {busy ? 'Sending…' : 'Email sign-in link'}
            </button>
          </form>
        )}
        {error && <p className="mt-4 border border-[#C4161C] bg-[#FFF3F3] p-3 text-sm text-[#C4161C]" role="alert">{error}</p>}
        {notice && <p className="mt-4 border border-[#0A95D4] bg-white p-3 text-sm text-[#00628F]" role="status">{notice}</p>}
      </section>
    </main>
  );
}
