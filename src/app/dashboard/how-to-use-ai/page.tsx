import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wand2, PieChart } from "lucide-react";
import Link from "next/link";

export default function HowToUseAiPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="How to Use the AI Features"
        description="Learn how to leverage AgriLog's AI to boost your farm's productivity."
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Wand2 className="h-6 w-6 text-primary" />
              AI Yield Prediction
            </CardTitle>
            <CardDescription>
              Forecast your harvest quantity before you even plant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This tool uses your historical farm data to predict the potential yield for a future crop. The more records you add, the smarter the predictions become.
            </p>
            <div>
              <h4 className="font-semibold">How to use it:</h4>
              <ol className="list-decimal list-inside space-y-2 mt-2 text-sm text-muted-foreground">
                <li>Navigate to the <Link href="/dashboard/yield-prediction" className="text-primary underline hover:text-primary/80">AI Prediction</Link> page from the sidebar.</li>
                <li>Fill in the details for the crop you plan to grow: crop type, area, planting date, estimated expenses, and the inputs you plan to use.</li>
                <li>Click the "Predict Yield" button.</li>
                <li>The AI will analyze your inputs and your past harvests to give you a predicted yield, a confidence score, and actionable insights.</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <PieChart className="h-6 w-6 text-primary" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              Understand your farm's financial health over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This feature analyzes all your past farm records to identify cost trends, profit margins, and opportunities for improvement.
            </p>
             <div>
              <h4 className="font-semibold">How to use it:</h4>
              <ol className="list-decimal list-inside space-y-2 mt-2 text-sm text-muted-foreground">
                <li>Make sure you have added at least one farm record on the <Link href="/dashboard/records" className="text-primary underline hover:text-primary/80">Records</Link> page.</li>
                <li>Navigate to the <Link href="/dashboard/analysis" className="text-primary underline hover:text-primary/80">AI Analysis</Link> page from the sidebar.</li>
                <li>Click the "Analyze My Farm Data" button.</li>
                <li>The AI will provide a detailed report on your cost trends, profitability, and give you personalized recommendations to optimize your expenses.</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
