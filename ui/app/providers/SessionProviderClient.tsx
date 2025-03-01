'use client';

import { SessionProvider } from 'next-auth/react';

interface SessionProviderClientProps {
  children: React.ReactNode;
  session: any; // Replace "any" with the proper type from next-auth if available
}

export default function SessionProviderClient({
  children,
  session,
}: SessionProviderClientProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
