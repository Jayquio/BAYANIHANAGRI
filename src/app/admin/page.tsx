'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';

import { useCollection, useFirestore } from '@/firebase';
import { AdminWrapper } from '@/components/layout/admin-wrapper';
import { AdminClient } from './admin-client';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { FarmRecord, User } from '@/lib/types';

export default function AdminPageRoot() {
  const firestore = useFirestore();

  const usersQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const farmRecordsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'farmRecords'));
  }, [firestore]);

  const { data: users, loading: usersLoading } = useCollection<User>(
    usersQuery
  );
  const { data: farmRecords, loading: recordsLoading } =
    useCollection<FarmRecord>(farmRecordsQuery);

  const loading = usersLoading || recordsLoading;

  return (
    <AdminWrapper>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Admin Dashboard"
          description="Aggregated data and analytics for all farmers."
        />
        {loading ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-28 rounded-lg" />
              <Skeleton className="h-28 rounded-lg" />
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
    </AdminWrapper>
  );
}
