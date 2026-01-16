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

  // The doc ref depends on the user, so it will be null initially.
  // useDoc is designed to handle a null ref.
  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<any>(
    userDocRef
  );

  // We are loading if either the user auth state or the profile doc is loading.
  const isLoading = userLoading || profileLoading;

  useEffect(() => {
    // This effect runs whenever the loading or profile status changes.
    // If we are done loading...
    if (!isLoading) {
      // ...and the user is not an admin (or doesn't have a profile)...
      if (userProfile?.isAdmin !== true) {
        // ...redirect them.
        router.replace('/dashboard');
      }
    }
  }, [isLoading, userProfile, router]);


  // If the user is a confirmed admin, show the dashboard content.
  if (!isLoading && userProfile?.isAdmin === true) {
    return <>{children}</>;
  }

  // In all other cases (still loading, or is not an admin and is about to be
  // redirected by the useEffect), show the full-screen verification loader.
  // This prevents any content from flashing before the user's status is confirmed.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Logo className="h-24 w-24 animate-pulse text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">
        Verifying permissions...
      </p>
    </div>
  );
}
