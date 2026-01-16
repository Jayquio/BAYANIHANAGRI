'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useDoc } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Logo } from '../icons';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export function AdminWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<any>(
    userDocRef
  );

  // Determine the definitive loading state. We are loading if auth is pending,
  // or if we have a user but are still waiting for their profile to load.
  const isLoading = userLoading || (user && profileLoading);

  useEffect(() => {
    // This effect should only handle redirection once loading is fully complete.
    if (!isLoading) {
      // If loading is done and the user is NOT a verified admin, redirect them.
      if (!userProfile?.isAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [isLoading, userProfile, router]);


  // STATE 1: We are still loading authentication or profile data.
  // Show the full-screen loader. This is the key to preventing the flicker.
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Logo className="h-24 w-24 animate-pulse text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Verifying permissions...
        </p>
      </div>
    );
  }

  // STATE 2: Loading is complete AND the user is a verified admin.
  // Only in this case do we render the children (the admin dashboard).
  if (userProfile?.isAdmin) {
    return <>{children}</>;
  }

  // STATE 3: Loading is complete but the user is NOT an admin.
  // The useEffect is handling the redirect. In the meantime, we continue
  // to show the loading screen to prevent any content from flashing.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Logo className="h-24 w-24 animate-pulse text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">
        Verifying permissions...
      </p>
    </div>
  );
}
