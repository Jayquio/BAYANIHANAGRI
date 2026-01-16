'use server';

/**
 * @fileOverview Provides cost vs. profit analysis for farmers.
 *
 * - costVsProfitAnalysis - Analyzes cost trends and profit margins over time.
 * - CostVsProfitAnalysisInput - The input type for the costVsProfitAnalysis function.
 * - CostVsProfitAnalysisOutput - The return type for the costVsProfitAnalysis function.
 */

import {ai} from '@/ai/genkit';
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

export async function costVsProfitAnalysis(input: CostVsProfitAnalysisInput): Promise<CostVsProfitAnalysisOutput> {
  return costVsProfitAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costVsProfitAnalysisPrompt',
  input: {schema: CostVsProfitAnalysisInputSchema},
  output: {schema: CostVsProfitAnalysisOutputSchema},
  prompt: `You are an expert agricultural analyst specializing in providing cost versus profit analysis for farmers in the Philippines.

  Analyze the provided farm records to identify cost trends and profit margins over time. For each record, calculate the revenue (harvestQuantity * marketPrice) and the profit (revenue - expenses).

  Provide a clear and actionable report. Start with a summary of overall profitability. Then, group your analysis by crop type if multiple types are present. For each crop, discuss cost trends, revenue, and profit margins. Finally, provide specific, actionable recommendations for optimizing expenses and improving profitability.

  Farm Records:
  {{#each farmRecords}}
  - Crop Type: {{cropType}}, Harvest Date: {{harvestDate}}, Expenses: ₱{{expenses}}, Harvest Quantity: {{harvestQuantity}}, Market Price: ₱{{marketPrice}}/unit
  {{/each}}
  `,
});

const costVsProfitAnalysisFlow = ai.defineFlow(
  {
    name: 'costVsProfitAnalysisFlow',
    inputSchema: CostVsProfitAnalysisInputSchema,
    outputSchema: CostVsProfitAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
