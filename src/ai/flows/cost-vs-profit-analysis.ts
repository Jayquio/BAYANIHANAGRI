'use server';

import { z } from 'zod';
import { callHuggingFace } from '@/ai/providers/huggingface';

// Input schema remains the same, but widened to accept the full record
const CostVsProfitAnalysisInputSchema = z.object({
  farmRecords: z.array(
    z.object({
      cropType: z.string(),
      harvestDate: z.string(),
      expenses: z.number(),
      harvestQuantity: z.number(),
      marketPrice: z.number(),
      id: z.string().optional(),
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

// New output schema from user's code
const CostVsProfitAnalysisOutputSchema = z.object({
    summary: z.string().describe("A 1-2 sentence summary of the analysis."),
    metrics: z.object({
        totalCost: z.number(),
        totalRevenue: z.number(),
        totalProfit: z.number(),
        profitMargin: z.number(),
    }),
    monthlyTrends: z.array(z.object({
        period: z.string(),
        cost: z.number(),
        revenue: z.number(),
        profit: z.number(),
        observation: z.string(),
    })),
    recommendations: z.array(z.string()),
});
export type CostVsProfitAnalysisOutput = z.infer<typeof CostVsProfitAnalysisOutputSchema>;


// Helper function from user's code
function extractJsonFromText(text: string): any {
  // First, try to strip markdown
  const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch {
    const first = cleanedText.indexOf('{');
    const last = cleanedText.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = cleanedText.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // fallthrough
      }
    }
    throw new Error('Unable to parse JSON from model output.');
  }
}

// Helper function from user's code
function buildAnalysisPrompt(totals: { totalCost: number; totalRevenue: number; totalProfit: number; profitMargin: number }, sampleRecords: any[]) {
  return `
You are an expert agricultural analyst. Use the computed totals and the sample records to produce ONLY one valid JSON object that matches the schema below.

Schema:
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

Computed totals (use these exact numbers; do not invent new totals):
${JSON.stringify(totals, null, 2)}

Sample records (up to 20 shown, use them to identify trends and make recommendations):
${JSON.stringify(sampleRecords, null, 2)}

Return ONLY a single, valid JSON object exactly matching the schema above. Do not include any other text, commentary, markdown, or code fences. Ensure all numeric fields are numbers, not strings.
`.trim();
}


// The main updated flow function
export async function costVsProfitAnalysis(input: CostVsProfitAnalysisInput): Promise<CostVsProfitAnalysisOutput> {
  const validationResult = CostVsProfitAnalysisInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error('AI input validation failed:', validationResult.error);
    throw new Error('Invalid data format for AI analysis.');
  }

  const { farmRecords } = validationResult.data;
  
  if (farmRecords.length === 0) {
      throw new Error("No farm records to analyze.");
  }

  // Compute deterministic aggregates locally
  const totalCost = farmRecords.reduce((s: number, r: any) => s + Number(r.expenses || 0), 0);
  const totalRevenue = farmRecords.reduce((s: number, r: any) => s + (Number(r.harvestQuantity || 0) * Number(r.marketPrice || 0)), 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;
  const totals = { totalCost, totalRevenue, totalProfit, profitMargin };

  // Use a sample of records to keep prompt size reasonable
  const sampleRecords = farmRecords.slice(0, 20).map(r => ({
      cropType: r.cropType,
      harvestDate: r.harvestDate,
      expenses: r.expenses,
      revenue: (r.harvestQuantity || 0) * (r.marketPrice || 0),
      profit: ((r.harvestQuantity || 0) * (r.marketPrice || 0)) - (r.expenses || 0)
  }));

  const prompt = buildAnalysisPrompt(totals, sampleRecords);
  const model = 'mistralai/Mistral-7B-Instruct-v0.2';

  try {
    const rawResponse = await callHuggingFace(model, prompt, { max_new_tokens: 1024 });
    const parsedJson = extractJsonFromText(rawResponse);
    
    // Validate the parsed JSON against our Zod schema
    const validatedOutput = CostVsProfitAnalysisOutputSchema.safeParse(parsedJson);

    if (!validatedOutput.success) {
        console.error("AI output validation failed:", validatedOutput.error.flatten());
        console.error("Raw AI output:", rawResponse);
        throw new Error("AI returned data in an unexpected format.");
    }
    
    // Also, ensure the metrics from the AI match our calculated ones as a sanity check.
    // This prevents the model from hallucinating different totals.
    validatedOutput.data.metrics = totals;

    return validatedOutput.data;

  } catch (err: any) {
    console.error('AI analysis error in flow:', err);
    if (err instanceof SyntaxError || err.message.includes('parse')) {
        throw new Error("AI returned invalid JSON. Please try again.");
    }
    throw err; // Re-throw other errors (e.g., from the provider)
  }
}
