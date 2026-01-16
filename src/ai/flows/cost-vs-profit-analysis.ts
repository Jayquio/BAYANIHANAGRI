'use server';

import {GoogleGenerativeAI} from '@google/generative-ai';
import {z} from 'zod';

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
export type CostVsProfitAnalysisInput = z.infer<
  typeof CostVsProfitAnalysisInputSchema
>;

const CostVsProfitAnalysisOutputSchema = z.object({
  analysis: z.string(),
});
export type CostVsProfitAnalysisOutput = z.infer<
  typeof CostVsProfitAnalysisOutputSchema
>;

export async function costVsProfitAnalysis(
  input: CostVsProfitAnalysisInput
): Promise<CostVsProfitAnalysisOutput> {
  const validationResult = CostVsProfitAnalysisInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error('AI input validation failed:', validationResult.error);
    throw new Error('Invalid data format for AI analysis.');
  }

  const {farmRecords} = validationResult.data;

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'The GOOGLE_GENAI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

  const prompt = `You are an expert agricultural analyst specializing in providing cost versus profit analysis for farmers in the Philippines.

  Analyze the provided farm records to identify cost trends and profit margins over time. For each record, calculate the revenue (harvestQuantity * marketPrice) and the profit (revenue - expenses).

  Provide a clear and actionable report. Start with a summary of overall profitability. Then, group your analysis by crop type if multiple types are present. For each crop, discuss cost trends, revenue, and profit margins. Finally, provide specific, actionable recommendations for optimizing expenses and improving profitability.

  The user's farm records are provided below in JSON format:
  ${JSON.stringify(farmRecords, null, 2)}

  Return ONLY the text of your analysis. Do not wrap it in JSON or Markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return {analysis: text};
  } catch (error) {
    console.error('Google AI Error:', error);
    throw new Error('The AI failed to generate a response. Please try again.');
  }
}
