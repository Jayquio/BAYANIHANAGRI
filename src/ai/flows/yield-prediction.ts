'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

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

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('The GOOGLE_GENAI_API_KEY environment variable is not set.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // ✅ FIX: Updated to 1.5-flash to support JSON mode
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json', 
    },
  });

  const prompt = `You are an AI advisor. Return valid JSON for: 
  - Crop: ${input.cropType}
  - Area: ${input.area} ha
  - Data: ${input.pastHarvestData}
  
  Predict yield (number), confidence (0-1 number), and insights (string).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonOutput = JSON.parse(text);

    const parsedOutput = YieldPredictionOutputSchema.safeParse(jsonOutput);
    if (!parsedOutput.success) {
      console.error("AI output validation failed:", parsedOutput.error);
      throw new Error("AI returned unexpected format.");
    }
    
    return parsedOutput.data;

  } catch (error: any) {
    console.error('Google AI Error:', error);
    throw new Error(`AI failed: ${error.message}`);
  }
}
