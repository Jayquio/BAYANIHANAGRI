'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, collection, query } from 'firebase/firestore';

import { useUser } from '@/firebase/auth/use-user';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import type { FarmRecord, User } from '@/lib/types';

import { PageHeader } from '@/components/page-header';
import { AdminClient } from '@/components/dashboard/admin/admin-client';
import { Logo } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


type VerificationStatus = 'VERIFYING' | 'ALLOWED' | 'DENIED';

export default function AdminPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('VERIFYING');

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  
  const { data: userProfile, loading: profileLoading } = useDoc<any>(userDocRef);

  useEffect(() => {
    const doneLoading = !userLoading && !profileLoading;

    if (doneLoading) {
      if (userProfile?.isAdmin) {
        setStatus('ALLOWED');
      } else {
        setStatus('DENIED');
      }
    }
  }, [userLoading, profileLoading, userProfile]);

  useEffect(() => {
    if (status === 'DENIED') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const usersQuery = useMemo(() => {
    if (status !== 'ALLOWED' || !firestore) return null;
    return query(collection(firestore, 'users'));
  }, [status, firestore]);

  const farmRecordsQuery = useMemo(() => {
    if (status !== 'ALLOWED' || !firestore) return null;
    return query(collection(firestore, 'farmRecords'));
  }, [status, firestore]);

  const { data: users, loading: usersLoading } = useCollection<User>(usersQuery);
  const { data: farmRecords, loading: recordsLoading } =
    useCollection<FarmRecord>(farmRecordsQuery);

  if (status !== 'ALLOWED') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Logo className="h-24 w-24 animate-pulse text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">
          Verifying permissions...
        </p>
      </div>
    );
  }

  const pageDataLoading = usersLoading || recordsLoading;

  return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Admin Dashboard"
          description="Aggregated data and analytics for all farmers."
        />
        {pageDataLoading ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <AdminClient users={users} farmRecords={farmRecords} />
        )}
      </div>
  );
}
