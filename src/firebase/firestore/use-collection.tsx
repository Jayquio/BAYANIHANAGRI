'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  collection as collectionFn,
  type Query,
  type DocumentData,
  type CollectionReference,
} from 'firebase/firestore';

import { useFirestore } from '@/firebase';

export function useCollection<T = DocumentData>(
  collectionPath: string | CollectionReference | Query | null
) {
  const db = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(!!collectionPath);
  const [error, setError] = useState<Error | null>(null);
  const prevIdsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }
    
    let ref: Query | CollectionReference;
    if (typeof collectionPath === 'string') {
      ref = collectionFn(db, collectionPath);
    } else {
      ref = collectionPath;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionPath, db]);

  return { data, loading, error };
}