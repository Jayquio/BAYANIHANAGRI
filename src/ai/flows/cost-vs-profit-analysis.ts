'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const CostVsProfitAnalysisInputSchema = z.object({
  farmRecords: z.array(
    z.object({
      cropType: z.string(),
      harvestDate: z.string(),
      expenses: z.number(),
      harvestQuantity: z.number(),
      marketPrice: z.number(),
    })
  ),
});
export type CostVsProfitAnalysisInput = z.infer<typeof CostVsProfitAnalysisInputSchema>;

const CostVsProfitAnalysisOutputSchema = z.object({
  analysis: z.string(),
});
export type CostVsProfitAnalysisOutput = z.infer<typeof CostVsProfitAnalysisOutputSchema>;

export async function costVsProfitAnalysis(input: CostVsProfitAnalysisInput): Promise<CostVsProfitAnalysisOutput> {
  const validationResult = CostVsProfitAnalysisInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error('AI input validation failed:', validationResult.error);
    throw new Error('Invalid data format for AI analysis.');
  }

  const { farmRecords } = validationResult.data;

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('The GOOGLE_GENAI_API_KEY environment variable is not set.');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  // ✅ FIX: Removed 'models/' prefix and upgraded to 1.5-flash
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert agricultural analyst. Analyze this data:
  ${JSON.stringify(farmRecords, null, 2)}
  
  Provide a cost vs profit summary. Just give the text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { analysis: text };
  } catch (err: any) {
    console.error('Generative AI error (cost-vs-profit-analysis):', err);

    const msg = (() => {
      const text = (err?.message ?? JSON.stringify(err)).toString();
      if (text.includes('API_KEY_SERVICE_BLOCKED')) {
        return 'AI service blocked for this API key or project. Check that the Generative Language API is enabled, billing is active, and the API key is allowed to call this API.';
      }
      if (text.includes('API key')) {
        return 'AI API key error. Ensure GOOGLE_GENAI_API_KEY is valid and has permission to call the Generative Language API.';
      }
      return 'AI service error. Check server logs for details.';
    })();

    // Throw a short, safe message (actions/index.ts will catch and return to client)
    throw new Error(msg);
  }
}
