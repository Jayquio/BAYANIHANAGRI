import { z } from 'zod';

export const YieldPredictionInputSchema = z.object({
  cropType: z.string(),
  plantingDate: z.string(),
  area: z.number(),
  expenses: z.number(),
  inputsUsed: z.string(),
  pastHarvestData: z.string(),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;


export const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number(),
  confidence: z.number(),
  insights: z.string(),
});

export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;