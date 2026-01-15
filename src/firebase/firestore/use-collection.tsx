'use client';

import { useEffect, useState } from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  getDocs,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }
    
    let ref: Query | CollectionReference;
    if (typeof collectionPath === 'string') {
      ref = collection(db, collectionPath);
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
