'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/dashboard/overview";
import { YieldOverTimeChart } from "@/components/dashboard/yield-over-time-chart";
import { RecentRecords } from "@/components/dashboard/recent-records";
import type { FarmRecordWithProfit } from "@/lib/types";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection, useDoc } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useMemo, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

function getRecordsWithProfit(records: any[]): FarmRecordWithProfit[] {
  if (!records) return [];
  return records.map((record) => {
    const revenue = record.harvestQuantity * record.marketPrice;
    const profit = revenue - record.expenses;
    return { ...record, revenue, profit };
  });
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<any>(userDocRef);

  const farmRecordsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, "farmRecords"), where("farmerId", "==", user.uid));
  }, [user, firestore]);

  const { data: farmRecords, loading: recordsLoading } = useCollection<any>(farmRecordsQuery!);

  useEffect(() => {
    if (userProfile && userProfile.isAdmin) {
      router.replace('/dashboard/admin');
    }
  }, [userProfile, router]);


  const recordsWithProfit = useMemo(() => getRecordsWithProfit(farmRecords), [farmRecords]);

  const loading = userLoading || recordsLoading || profileLoading;

  if (loading || (userProfile && userProfile.isAdmin)) { // Prevent rendering farmer dashboard for admin
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Welcome!"
          description="Loading your dashboard..."
        >
        </PageHeader>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome Back, ${user?.displayName?.split(' ')[0] || 'Farmer'}!`}
        description="Here's an overview of your farm's performance."
      >
        <Button asChild>
          <Link href="/dashboard/records">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Record
          </Link>
        </Button>
      </PageHeader>
      <Overview records={recordsWithProfit} />
      <div className="grid gap-6 lg:grid-cols-2">
        <YieldOverTimeChart records={recordsWithProfit} />
        <RecentRecords records={recordsWithProfit} />
      </div>
    </div>
  );
}
