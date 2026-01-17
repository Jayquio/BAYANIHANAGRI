'use server';

import { z } from 'zod';
import { callHuggingFace } from '@/ai/providers/huggingface';

const YieldPredictionInputSchema = z.object({
  cropType: z.string(),
  plantingDate: z.string(),
  area: z.number(),
  expenses: z.number(),
  inputsUsed: z.string(),
  pastHarvestData: z.string(),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number(),
  confidence: z.number(),
  insights: z.string(),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function yieldPrediction(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
  const validationResult = YieldPredictionInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error('AI input validation failed:', validationResult.error);
    throw new Error('Invalid data format for AI prediction.');
  }

  const { cropType, area, pastHarvestData, inputsUsed, expenses, plantingDate } = input;

  const prompt = `Based on the following farm data, predict the yield.
  
  Current crop: ${cropType}
  Planting Date: ${plantingDate}
  Area: ${area} hectares
  Expenses: ${expenses}
  Inputs Used: ${inputsUsed}
  Historical data: ${pastHarvestData}
  
  Return ONLY a valid JSON object with the following structure:
  {
    "predictedYield": <number>,
    "confidence": <number between 0 and 1>,
    "insights": "<string with analysis and recommendations>"
  }
  
  Do not include any other text, explanation, or formatting outside of the single JSON object.`;

  try {
    const rawJsonString = await callHuggingFace('mistralai/Mistral-7B-Instruct-v0.2', prompt, { max_new_tokens: 500 });
    
    // The model might return the JSON inside markdown ```json ... ```, so let's strip that.
    const cleanedString = rawJsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonOutput = JSON.parse(cleanedString);

    const parsedOutput = YieldPredictionOutputSchema.safeParse(jsonOutput);
    if (!parsedOutput.success) {
      console.error("AI output validation failed:", parsedOutput.error);
      throw new Error("AI returned an unexpected format.");
    }
    
    return parsedOutput.data;

  } catch (err: any) {
    console.error('AI prediction error in flow:', err);
    if (err instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    throw err; // Re-throw other errors (e.g., from the provider)
  }
}
