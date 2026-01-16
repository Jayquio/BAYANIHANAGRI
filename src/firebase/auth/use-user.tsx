'use client';

import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { useAuth } from '@/firebase/provider';

const useUser = () => {
  const auth = useAuth();

  // Initialize synchronously from auth.currentUser to avoid initial loading flicker
  const initialUser = auth?.currentUser ?? null;

  const [user, setUser] = useState<User | null>(initialUser);
  // If we have a currentUser, we are already "loaded" for UI purposes.
  const [loading, setLoading] = useState<boolean>(initialUser ? false : true);

  // Keep a ref so we only update state when the value actually changes.
  const prevUidRef = useRef<string | null>(initialUser?.uid ?? null);

  useEffect(() => {
    // Subscribe to auth state changes and only update when uid actually changes.
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      const nextUid = nextUser?.uid ?? null;

      // If uid unchanged, do nothing (prevents re-renders / flicker).
      if (prevUidRef.current === nextUid) {
        // Ensure loading is false if it was true
        if (loading) setLoading(false);
        return;
      }

      prevUidRef.current = nextUid;
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
    // We purposely do not add `loading` to deps to avoid re-subscribing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return { user, loading };
};

export { useUser };
