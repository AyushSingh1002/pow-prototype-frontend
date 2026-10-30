'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { StaffProvider, useStaff } from '../../context/StaffContext';

function StaffRouteGuard({ children }: { children: ReactNode }) {
  const { session, authReady } = useStaff();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/staff/login';
  const isAuthorized = session?.role === 'staff' || session?.role === 'admin';

  useEffect(() => {
    if (authReady && !isLogin && !isAuthorized) router.replace('/staff/login');
  }, [authReady, isAuthorized, isLogin, router]);

  if (!authReady && !isLogin) {
    return <main className="mx-auto max-w-7xl px-5 py-8" aria-busy="true">Restoring staff session…</main>;
  }
  if (!isLogin && !isAuthorized) return null;
  return children;
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <StaffProvider>
      <StaffRouteGuard>{children}</StaffRouteGuard>
    </StaffProvider>
  );
}
