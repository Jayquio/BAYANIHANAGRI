"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { getCostVsProfitAnalysis } from "@/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Lightbulb,
  Bot,
  PlusCircle,
  TrendingUp,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { CostVsProfitAnalysisOutput } from "@/ai/flows/cost-vs-profit-analysis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AnalysisState = {
  message: string;
  data?: CostVsProfitAnalysisOutput;
};

const formatCurrency = (amount: number) => {
  return `₱ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export function AnalysisClient() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<AnalysisState | null>(
    null
  );
  const { toast } = useToast();

  const farmRecordsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(firestore, "farmRecords"),
      where("farmerId", "==", user.uid)
    );
  }, [user, firestore]);

  const { data: farmRecords, loading: recordsLoading } =
    useCollection<any>(farmRecordsQuery!);

  const hasRecords = farmRecords && farmRecords.length > 0;

  const handleAnalysis = () => {
    startTransition(async () => {
      if (!hasRecords) {
        toast({
          title: "No data to analyze",
          description: "Please add some farm records first.",
          variant: "destructive",
        });
        return;
      }
      const result = await getCostVsProfitAnalysis(farmRecords);
      if (result.message !== "success") {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      setAnalysisResult(result as AnalysisState);
    });
  };

  const renderAnalysisResult = () => {
    if (!analysisResult?.data) return null;

    const { summary, metrics, monthlyTrends, recommendations } =
      analysisResult.data;

    return (
      <div className="space-y-8">
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot className="text-primary" /> AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{summary}</p>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics.totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(metrics.totalCost)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profit
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  metrics.totalProfit >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {formatCurrency(metrics.totalProfit)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Profit Margin
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.profitMargin * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        {monthlyTrends && monthlyTrends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                A breakdown of performance over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead>Observation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTrends.map((trend) => (
                    <TableRow key={trend.period}>
                      <TableCell className="font-medium">
                        {trend.period}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          trend.profit >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {formatCurrency(trend.profit)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {trend.observation}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb className="text-primary" /> AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  if (recordsLoading) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Start Analysis</CardTitle>
          <CardDescription>
            Click the button to analyze all your farm data and receive
            AI-powered insights on cost trends and profitability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalysis} disabled={isPending || !hasRecords}>
            {isPending ? "Analyzing..." : "Analyze My Farm Data"}
          </Button>
        </CardContent>
      </Card>

      {isPending && (
         <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3 mt-2" />
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      )}

      {analysisResult?.data && renderAnalysisResult()}

      {!isPending && !analysisResult && hasRecords && (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold">Awaiting Analysis</h3>
            <p className="text-muted-foreground">
              Your analysis results will appear here.
            </p>
          </div>
        </div>
      )}

      {!isPending && !hasRecords && (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold">No Data to Analyze</h3>
          <p className="mb-4 text-muted-foreground">
            Add at least one farm record to use the AI analysis feature.
          </p>
          <Button asChild>
            <Link href="/dashboard/records">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Record
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
