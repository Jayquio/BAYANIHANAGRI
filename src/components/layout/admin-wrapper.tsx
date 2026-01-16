'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore } from '@/firebase';
import { Logo } from '../icons';

type VerificationState = 'VERIFYING' | 'ALLOWED' | 'DENIED';

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [state, setState] = useState<VerificationState>('VERIFYING');

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    // We remain in the 'VERIFYING' state until all loading is complete.
    if (userLoading || profileLoading) {
      setState('VERIFYING');
      return;
    }

    // After loading, we can make a final decision.
    if (user && userProfile?.isAdmin) {
      setState('ALLOWED');
    } else {
      setState('DENIED');
    }
  }, [user, userLoading, userProfile, profileLoading]);

  // Handle redirection or rendering based on the final state.
  useEffect(() => {
    if (state === 'DENIED') {
      router.replace('/dashboard');
    }
  }, [state, router]);

  if (state === 'ALLOWED') {
    return <>{children}</>;
  }

  // For 'VERIFYING' or 'DENIED' (before redirect completes), show loading.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Logo className="h-24 w-24 animate-pulse text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">
        Verifying permissions...
      </p>
    </div>
  );
}
