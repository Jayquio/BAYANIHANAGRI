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

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  },[user, firestore]);

  const { data: userProfile, loading: profileLoading } = useDoc<any>(userDocRef);

  const farmRecordsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, "farmRecords"), where("farmerId", "==", user.uid));
  }, [user, firestore]);

  const { data: farmRecords } = useCollection<any>(farmRecordsQuery);

  const initialDataLoading = userLoading || profileLoading;

  useEffect(() => {
    // Once we are done loading user and profile data...
    if (!initialDataLoading) {
      // and we have confirmed the user is an admin...
      if (userProfile?.isAdmin) {
        // ...redirect them to the new top-level admin page.
        router.replace('/admin');
      }
    }
  }, [initialDataLoading, userProfile, router]);


  const recordsWithProfit = useMemo(() => getRecordsWithProfit(farmRecords), [farmRecords]);


  // If the initial data is still loading, OR if the user is an admin
  // (and is currently being redirected), show the loading skeleton.
  if (initialDataLoading || userProfile?.isAdmin) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 py-8">
          <PageHeader
            title="Dashboard"
            description="Loading your farm overview..."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-80 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the farmer's dashboard.
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-8 py-8">
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <YieldOverTimeChart records={recordsWithProfit} />
          </div>
          <div className="lg:col-span-1">
            <RecentRecords records={recordsWithProfit} />
          </div>
        </div>
      </div>
    </div>
  );
}
