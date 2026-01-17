'use server';

import { z } from 'zod';
import { callHuggingFace } from '@/ai/providers/huggingface';

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

  const prompt = `You are an expert agricultural analyst. Analyze this data:
  ${JSON.stringify(farmRecords, null, 2)}
  
  Provide a cost vs profit summary. Just give the text.`;

  try {
    const rawAnalysis = await callHuggingFace('mistralai/Mistral-7B-Instruct-v0.2', prompt, { max_new_tokens: 400 });
    return { analysis: rawAnalysis };
  } catch (err: any) {
    // The callHuggingFace provider already normalizes errors. We just log and re-throw.
    console.error('AI analysis error in flow:', err);
    throw err;
  }
}
