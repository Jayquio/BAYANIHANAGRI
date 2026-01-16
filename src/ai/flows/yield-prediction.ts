'use server';
/**
 * @fileOverview A yield prediction AI agent.
 *
 * - yieldPrediction - A function that handles the yield prediction process.
 * - YieldPredictionInput - The input type for the yieldPrediction function.
 * - YieldPredictionOutput - The return type for the yieldPrediction function.
 */

import {getAi} from '@/ai/genkit';
import {z} from 'genkit';

const YieldPredictionInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., rice, corn, banana, vegetables).'),
  plantingDate: z.string().describe('The planting date of the crop (YYYY-MM-DD).'),
  area: z.number().describe('The area of the farm in hectares.'),
  expenses: z.number().describe('The expenses incurred in ₱ (seeds, fertilizer, labor).'),
  inputsUsed: z.string().describe('The types and amounts of inputs used (fertilizer, pesticides, etc.).'),
  pastHarvestData: z.string().describe('Historical harvest data for the farm (yield, inputs, expenses).'),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number().describe('The predicted yield in sacks/kg.'),
  confidence: z.number().describe('A confidence score (0-1) for the prediction.'),
  insights: z.string().describe('Insights and recommendations based on the prediction.'),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;


function buildYieldPrompt(input: YieldPredictionInput): string {
    return `You are an AI-powered agricultural advisor for Filipino farmers. Based on the historical data, crop type, planting date, expenses, and inputs, predict the yield for the farm.

Your response MUST be a valid JSON object with the following keys: "predictedYield" (number), "confidence" (a number between 0 and 1), and "insights" (string).

Your analysis should be based on the following information:

Crop Type: ${input.cropType}
Planting Date: ${input.plantingDate}
Area (hectares): ${input.area}
Expenses (₱): ${input.expenses}
Inputs Used: ${input.inputsUsed}
Past Harvest Data: ${input.pastHarvestData}
`;
}


export async function yieldPrediction(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
    const ai = getAi();
    const promptText = buildYieldPrompt(input);
    
    const response = await ai.generate({
        prompt: promptText,
    });
    
    const jsonString = response.text;
    if (!jsonString) {
      throw new Error('AI failed to return a prediction.');
    }

    try {
      // The AI might wrap the JSON in markdown, so we clean it.
      const cleanedJson = jsonString.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      const parsedOutput = JSON.parse(cleanedJson);
      return parsedOutput;
    } catch (e) {
      console.error("Failed to parse AI JSON response:", jsonString, e);
      throw new Error("The AI returned an unexpected format. Please try again.");
    }
}
