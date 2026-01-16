"use client";

import { useActionState, useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";
import { getYieldPrediction } from "@/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Predicting..." : "Predict Yield"}
    </Button>
  );
}

export function PredictionClient() {
  const [state, formAction] = useActionState(getYieldPrediction, initialState);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const farmRecordsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(firestore, "farmRecords"), where("farmerId", "==", user.uid));
  }, [user, firestore]);

  const { data: farmRecords } = useCollection<any>(farmRecordsQuery);


  useEffect(() => {
    if (state?.message && state.message !== "success") {
       toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Yield Prediction</CardTitle>
            <CardDescription>
              Fill in the details to get an AI-powered yield prediction. Your past farm data will be used to improve accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="hidden" name="pastHarvestData" value={farmRecords ? JSON.stringify(farmRecords) : "[]"} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Input id="cropType" name="cropType" placeholder="e.g., Rice" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area (hectares)</Label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantingDate">Planting Date</Label>
              <Input id="plantingDate" name="plantingDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenses">Expenses (₱)</Label>
              <Input
                id="expenses"
                name="expenses"
                type="number"
                placeholder="e.g., 15000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputsUsed">Inputs Used</Label>
              <Textarea
                id="inputsUsed"
                name="inputsUsed"
                placeholder="List fertilizers, pesticides, etc."
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      <div className="space-y-6">
        {state?.data ? (
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <TrendingUp className="text-primary" /> Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Predicted Yield</Label>
                <p className="text-3xl font-bold font-headline text-primary">
                  {(state.data as any).predictedYield.toLocaleString()}{" "}
                  <span className="text-lg font-normal text-foreground">
                    sacks/kg
                  </span>
                </p>
              </div>
              <div>
                <Label className="text-sm">Confidence Score</Label>
                <p className="text-xl font-semibold">
                  {Math.round((state.data as any).confidence * 100)}%
                </p>
              </div>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Insights & Recommendations</AlertTitle>
                <AlertDescription>{(state.data as any).insights}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-8 text-center">
            <div>
              <h3 className="text-lg font-semibold">Awaiting Prediction</h3>
              <p className="text-muted-foreground">
                Your prediction results will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
