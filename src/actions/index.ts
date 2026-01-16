"use server";

import { z } from "zod";
import {
  yieldPrediction,
  YieldPredictionInput,
} from "@/ai/flows/yield-prediction";
import {
  costVsProfitAnalysis,
  CostVsProfitAnalysisInput,
} from "@/ai/flows/cost-vs-profit-analysis";
import type { FarmRecord } from "@/lib/types";

const yieldPredictionFormSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  plantingDate: z.string().min(1, "Planting date is required."),
  area: z.coerce.number().positive("Area must be a positive number."),
  expenses: z.coerce.number().positive("Expenses must be a positive number."),
  inputsUsed: z.string().min(1, "Inputs used are required."),
  pastHarvestData: z.string().min(1, "Past harvest data is required."),
});


export async function getYieldPrediction(prevState: any, formData: FormData) {
  const validatedFields = yieldPredictionFormSchema.safeParse({
    cropType: formData.get("cropType"),
    plantingDate: formData.get("plantingDate"),
    area: formData.get("area"),
    expenses: formData.get("expenses"),
    inputsUsed: formData.get("inputsUsed"),
    pastHarvestData: formData.get("pastHarvestData"),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await yieldPrediction(validatedFields.data);
    return { message: "success", data: result };
  } catch (error: any) {
    console.error(error);
    return { message: error.message || "Prediction failed. Please try again." };
  }
}

export async function getCostVsProfitAnalysis(farmRecords: FarmRecord[]) {
  if (!farmRecords || farmRecords.length === 0) {
    return { message: "No farm records found to analyze." };
  }

  try {
    // The AI function now handles its own validation. We just pass the data.
    const analysisRecords = farmRecords.map((record) => ({
      cropType: record.cropType ?? "",
      harvestDate: record.harvestDate
        ? new Date(record.harvestDate).toISOString().split("T")[0]
        : "",
      expenses: Number(record.expenses) || 0,
      harvestQuantity: Number(record.harvestQuantity) || 0,
      marketPrice: Number(record.marketPrice) || 0,
    }));

    const input: CostVsProfitAnalysisInput = {
      farmRecords: analysisRecords,
    };
    
    const result = await costVsProfitAnalysis(input);
    return { message: "success", data: result };

  } catch (error: any) {
    console.error("AI analysis error:", error);
    return { message: error.message || "Analysis failed. Please try again." };
  }
}
