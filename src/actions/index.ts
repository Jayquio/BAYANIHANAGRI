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

const yieldPredictionSchema = z.object({
  cropType: z.string().min(1, "Crop type is required."),
  plantingDate: z.string().min(1, "Planting date is required."),
  area: z.coerce.number().positive("Area must be a positive number."),
  expenses: z.coerce.number().positive("Expenses must be a positive number."),
  inputsUsed: z.string().min(1, "Inputs used are required."),
  pastHarvestData: z.string().min(1, "Past harvest data is required."),
});

export async function getYieldPrediction(prevState: any, formData: FormData) {
  const validatedFields = yieldPredictionSchema.safeParse({
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
    const input: YieldPredictionInput = {
      ...validatedFields.data,
    };
    const result = await yieldPrediction(input);
    return { message: "success", data: result };
  } catch (error) {
    console.error(error);
    return { message: "Prediction failed. Please try again." };
  }
}

export async function getCostVsProfitAnalysis(farmRecords: FarmRecord[]) {
  try {
    const input: CostVsProfitAnalysisInput = {
      farmRecords: farmRecords,
    };
    const result = await costVsProfitAnalysis(input);
    return { message: "success", data: result };
  } catch (error) {
    console.error(error);
    return { message: "Analysis failed. Please try again." };
  }
}
