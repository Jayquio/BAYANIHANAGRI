'use server';
/**
 * @fileOverview A yield prediction AI agent.
 *
 * - yieldPrediction - A function that handles the yield prediction process.
 * - YieldPredictionInput - The input type for the yieldPrediction function.
 * - YieldPredictionOutput - The return type for the yieldPrediction function.
 */

import {ai} from '@/ai/genkit';
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

// This is now a standard async function, compliant with "use server"
export async function yieldPrediction(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
  // The AI prompt is defined on-demand inside the function
  const prompt = ai.definePrompt({
    name: 'yieldPredictionPrompt',
    input: {schema: YieldPredictionInputSchema},
    output: {schema: YieldPredictionOutputSchema},
    prompt: `You are an AI-powered agricultural advisor for Filipino farmers. Based on the historical data, crop type, planting date, expenses, and inputs, predict the yield for the farm.

    Provide a predicted yield in sacks/kg, a confidence score (0-1), and insights with planting recommendations. Your analysis should be based on the following information.

    Crop Type: {{{cropType}}}
    Planting Date: {{{plantingDate}}}
    Area (hectares): {{{area}}}
    Expenses (₱): {{{expenses}}}
    Inputs Used: {{{inputsUsed}}}
    Past Harvest Data: {{{pastHarvestData}}}
    `,
  });

  // Execute the prompt and return the output
  const {output} = await prompt(input);
  if (!output) {
      throw new Error("AI prediction returned no output.");
  }
  return output;
}
