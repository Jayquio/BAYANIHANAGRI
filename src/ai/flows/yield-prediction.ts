
'use server';

import { callLocalModelForYieldPrediction } from '@/ai/providers/local-model';
import { YieldPredictionInputSchema, type YieldPredictionInput, type YieldPredictionOutput } from '@/ai/schemas/prediction';

export type { YieldPredictionInput, YieldPredictionOutput };

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
    const result = await callLocalModelForYieldPrediction(prompt);
    return result;

  } catch (err: any) {
    console.error('AI prediction error in flow:', err);
    if (err instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON. Please try again.");
    }
    throw err; // Re-throw other errors
  }
}
