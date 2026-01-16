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

// Schema for validation, moved here to fix 'use server' export error.
const CostVsProfitAnalysisInputSchema = z.object({
  farmRecords: z.array(
    z.object({
      cropType: z.string().describe("The type of crop (e.g., rice, corn)."),
      harvestDate: z
        .string()
        .describe("The date the crop was harvested (YYYY-MM-DD)."),
      expenses: z
        .number()
        .describe("The total expenses for the crop in Philippine pesos."),
      harvestQuantity: z
        .number()
        .describe("The quantity of the harvest in sacks or kilograms."),
      marketPrice: z
        .number()
        .describe("The market price per unit of harvest."),
    })
  ),
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
  // Guard against empty records
  if (!farmRecords || farmRecords.length === 0) {
    return { message: "No farm records found to analyze." };
  }

  try {
    // Sanitize and map records to match the AI's expected input schema
    const analysisRecords = farmRecords.map((record) => ({
      cropType: record.cropType ?? "",
      // Ensure date is in YYYY-MM-DD format
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
    
    // For debugging: Log the sanitized input
    console.log("Input for AI analysis:", JSON.stringify(input, null, 2));

    // Validate the input against the Zod schema before calling the AI
    const validated = CostVsProfitAnalysisInputSchema.safeParse(input);

    if (!validated.success) {
      console.error("AI input validation failed:", validated.error.flatten());
      return {
        message: "Data validation failed. Check records for missing/invalid data.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    // Call the AI flow with the validated data
    const result = await costVsProfitAnalysis(validated.data);
    return { message: "success", data: result };

  } catch (error: any) {
    // For debugging: Log the error from the AI call
    console.error("AI analysis error:", error);
    return { message: "Analysis failed. Please try again." };
  }
}
