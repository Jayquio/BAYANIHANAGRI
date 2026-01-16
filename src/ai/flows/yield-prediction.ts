'use server';

import {GoogleGenerativeAI} from '@google/generative-ai';
import {z} from 'zod';

const YieldPredictionInputSchema = z.object({
  cropType: z.string(),
  plantingDate: z.string(),
  area: z.number(),
  expenses: z.number(),
  inputsUsed: z.string(),
  pastHarvestData: z.string(),
});
export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number(),
  confidence: z.number(),
  insights: z.string(),
});
export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function yieldPrediction(
  input: YieldPredictionInput
): Promise<YieldPredictionOutput> {
  const validationResult = YieldPredictionInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error('AI input validation failed:', validationResult.error);
    throw new Error('Invalid data format for AI prediction.');
  }

  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'The GOOGLE_GENAI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are an AI-powered agricultural advisor for Filipino farmers. Based on the historical data, crop type, planting date, expenses, and inputs, predict the yield for the farm.

Your response MUST be a valid JSON object matching this schema: ${JSON.stringify(YieldPredictionOutputSchema.shape)}.

Your analysis should be based on the following information:
- Crop Type: ${input.cropType}
- Planting Date: ${input.plantingDate}
- Area (hectares): ${input.area}
- Expenses (₱): ${input.expenses}
- Inputs Used: ${input.inputsUsed}
- Past Harvest Data: ${input.pastHarvestData}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonOutput = JSON.parse(text);

    const parsedOutput = YieldPredictionOutputSchema.safeParse(jsonOutput);
    if (!parsedOutput.success) {
        console.error("AI output validation failed:", parsedOutput.error);
        throw new Error("AI returned data in an unexpected format.");
    }
    
    return parsedOutput.data;

  } catch (error) {
    console.error('Google AI Error:', error);
    throw new Error('The AI failed to generate a prediction. Please try again.');
  }
}
