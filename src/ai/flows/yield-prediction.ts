'use server';

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


export async function yieldPrediction(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
    // AI is initialized and the prompt is defined inside the request handler,
    // which is compliant with Next.js Server Actions.
    const ai = getAi();

    const yieldPredictionPrompt = ai.definePrompt({
        input: { schema: YieldPredictionInputSchema },
        output: { schema: YieldPredictionOutputSchema },
        prompt: `You are an AI-powered agricultural advisor for Filipino farmers. Based on the historical data, crop type, planting date, expenses, and inputs, predict the yield for the farm.

    Your response MUST be a valid JSON object with the following keys: "predictedYield" (number), "confidence" (a number between 0 and 1), and "insights" (string).

    Your analysis should be based on the following information:

    Crop Type: {{cropType}}
    Planting Date: {{plantingDate}}
    Area (hectares): {{area}}
    Expenses (₱): {{expenses}}
    Inputs Used: {{inputsUsed}}
    Past Harvest Data: {{pastHarvestData}}
    `
    });

    const { output } = await yieldPredictionPrompt(input);
    if (!output) {
        throw new Error("AI failed to return a prediction.");
    }
    return output;
}
