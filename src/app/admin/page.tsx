'use client';

import { PageHeader } from '@/components/page-header';
import { AdminClient } from '@/components/dashboard/admin/admin-client';
import { AdminWrapper } from '@/components/layout/admin-wrapper';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { FarmRecord, User } from '@/lib/types';

// This file is essentially the admin dashboard but at a top-level /admin route.
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

  const { data: users, loading: usersLoading } = useCollection<User>(usersQuery);
  const { data: farmRecords, loading: recordsLoading } =
    useCollection<FarmRecord>(farmRecordsQuery);

  const loading = usersLoading || recordsLoading;

  return (
    <AdminWrapper>
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <PageHeader
          title="Admin Dashboard"
          description="Aggregated data and analytics for all farmers."
        />
        {loading ? (
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
    </AdminWrapper>
  );
}
