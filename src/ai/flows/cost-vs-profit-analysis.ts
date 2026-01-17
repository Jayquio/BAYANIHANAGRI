
'use server';

import { callLocalModelForAnalysis } from '@/ai/providers/local-model';
import { z } from 'zod';
import type { Analysis as CostVsProfitAnalysisOutput } from '@/ai/schemas/analysis';

// Re-export for compatibility with components that might import it
export type { CostVsProfitAnalysisOutput };


const CostVsProfitAnalysisInputSchema = z.object({
  farmRecords: z.array(
    z.object({
      cropType: z.string().optional(),
      harvestDate: z.string().optional(),
      expenses: z.number().optional(),
      harvestQuantity: z.number().optional(),
      marketPrice: z.number().optional(),
      id: z.string().optional(), // Allow full record
      plantingDate: z.string().optional(),
      area: z.number().optional(),
      inputsUsed: z.string().optional(),
      farmerId: z.string().optional(),
      revenue: z.number().optional(),
      profit: z.number().optional(),
    })
  ),
});

export type CostVsProfitAnalysisInput = z.infer<typeof CostVsProfitAnalysisInputSchema>;


export async function costVsProfitAnalysis(input: CostVsProfitAnalysisInput): Promise<CostVsProfitAnalysisOutput> {
  const validation = CostVsProfitAnalysisInputSchema.safeParse(input);
  if (!validation.success) {
      console.error('AI input validation failed:', validation.error);
    throw new Error('Invalid input for cost-vs-profit analysis.');
  }

  const { farmRecords } = validation.data;

  if (farmRecords.length === 0) {
      throw new Error("No farm records to analyze.");
  }

  // Compute deterministic totals locally
  const totalCost = farmRecords.reduce((s, r) => s + (Number(r.expenses) || 0), 0);
  const totalRevenue = farmRecords.reduce(
    (s, r) => s + (Number(r.harvestQuantity || 0) * Number(r.marketPrice || 0) || 0),
    0
  );
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

  const totals = { totalCost, totalRevenue, totalProfit, profitMargin };

  // Build concise prompt including computed totals and a small sample of records
  const sample = farmRecords.slice(0, 20); // keep prompt small
  const prompt = `
You are an expert agricultural analyst. Use the computed totals and the sample records below.
Return ONLY a single valid JSON object with this schema:
{
  "summary": "string (1-2 sentences summary of the overall financial health)",
  "metrics": {
    "totalCost": "number",
    "totalRevenue": "number",
    "totalProfit": "number",
    "profitMargin": "number (0-1, representing percentage)"
  },
  "monthlyTrends": [
    { "period": "YYYY-MM", "cost": "number", "revenue": "number", "profit": "number", "observation": "string (a brief observation about this month)" }
  ],
  "recommendations": ["string", "... up to 5 actionable recommendations"]
}

Computed totals (use these numbers; do not invent totals):
${JSON.stringify(totals, null, 2)}

Sample records:
${JSON.stringify(sample, null, 2)}

Return only the JSON object with no commentary.
`.trim();

  try {
    const result = await callLocalModelForAnalysis(prompt);
    // Sanity check to ensure the model used our numbers
    result.metrics = totals;
    return result;
  } catch (err: any) {
    console.error('Local model analysis error:', err?.message ?? err, err?.details ?? '');
    throw new Error(err?.message ?? 'AI analysis failed. Check server logs.');
  }
}
