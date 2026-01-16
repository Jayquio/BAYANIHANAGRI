import { PageHeader } from "@/components/page-header";
import { AnalysisClient } from "@/components/dashboard/analysis/analysis-client";

export default function AnalysisPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AI Cost vs. Profit Analysis"
        description="Get AI-powered insights on cost trends and profit margins."
      />
      <AnalysisClient />
    </div>
  );
}
