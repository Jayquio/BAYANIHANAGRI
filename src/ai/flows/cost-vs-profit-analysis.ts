'use server';

/**
 * @fileOverview Provides cost vs. profit analysis for farmers.
 *
 * - costVsProfitAnalysis - Analyzes cost trends and profit margins over time.
 * - CostVsProfitAnalysisInput - The input type for the costVsProfitAnalysis function.
 * - CostVsProfitAnalysisOutput - The return type for the costVsProfitAnalysis function.
 */

import {getAi} from '@/ai/genkit';
import {z} from 'genkit';

const CostVsProfitAnalysisInputSchema = z.object({
  farmRecords: z.array(
    z.object({
      cropType: z.string().describe('The type of crop (e.g., rice, corn).'),
      harvestDate: z.string().describe('The date the crop was harvested (YYYY-MM-DD).'),
      expenses: z.number().describe('The total expenses for the crop in Philippine pesos.'),
      harvestQuantity: z.number().describe('The quantity of the harvest in sacks or kilograms.'),
      marketPrice: z.number().describe('The market price per unit of harvest.'),
    })
  ).describe('An array of farm records, each containing crop details, expenses, and harvest data.'),
});
export type CostVsProfitAnalysisInput = z.infer<typeof CostVsProfitAnalysisInputSchema>;

const CostVsProfitAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of cost trends and profit margins over time, including recommendations for optimizing expenses and improving profitability.'),
});
export type CostVsProfitAnalysisOutput = z.infer<typeof CostVsProfitAnalysisOutputSchema>;

function buildPrompt(input: CostVsProfitAnalysisInput): string {
  const recordsString = input.farmRecords
    .map(
      (record) =>
        `- Crop Type: ${record.cropType}, Harvest Date: ${record.harvestDate}, Expenses: ₱${record.expenses}, Harvest Quantity: ${record.harvestQuantity}, Market Price: ₱${record.marketPrice}/unit`
    )
    .join('\n');

  return `You are an expert agricultural analyst specializing in providing cost versus profit analysis for farmers in the Philippines.

    Analyze the provided farm records to identify cost trends and profit margins over time. For each record, calculate the revenue (harvestQuantity * marketPrice) and the profit (revenue - expenses).

    Provide a clear and actionable report. Start with a summary of overall profitability. Then, group your analysis by crop type if multiple types are present. For each crop, discuss cost trends, revenue, and profit margins. Finally, provide specific, actionable recommendations for optimizing expenses and improving profitability.

    Farm Records:
    ${recordsString}
    `;
}

export async function costVsProfitAnalysis(input: CostVsProfitAnalysisInput): Promise<CostVsProfitAnalysisOutput> {
  const ai = getAi();
  const promptText = buildPrompt(input);

  const response = await ai.generate({
    prompt: promptText,
  });

  const analysisText = response.text;

  if (!analysisText) {
    throw new Error("AI failed to return an analysis.");
  }
  
  return { analysis: analysisText };
}
