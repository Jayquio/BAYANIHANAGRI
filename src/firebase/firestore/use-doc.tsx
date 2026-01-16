'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  doc as docFn,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';

import { useFirestore } from '@/firebase';

export function useDoc<T = DocumentData>(
  docPath: string | DocumentReference | null
) {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!docPath);
  const [error, setError] = useState<Error | null>(null);
  const prevPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!docPath) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    let ref: DocumentReference;
    if (typeof docPath === 'string') {
      ref = docFn(db, docPath);
    } else {
      ref = docPath;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const payload = JSON.stringify(snapshot.data());
          if (prevPayloadRef.current !== payload) {
            prevPayloadRef.current = payload;
            setData({ id: snapshot.id, ...snapshot.data() } as T);
          }
        } else {
          if (prevPayloadRef.current !== null) {
            prevPayloadRef.current = null;
            setData(null);
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docPath, db]);

  return { data, loading, error };
}
