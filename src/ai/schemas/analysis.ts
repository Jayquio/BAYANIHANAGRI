import { z } from 'zod';

export const AnalysisSchema = z.object({
  summary: z.string(),
  metrics: z.object({
    totalCost: z.number(),
    totalRevenue: z.number(),
    totalProfit: z.number(),
    profitMargin: z.number(),
  }),
  monthlyTrends: z.array(
    z.object({
      period: z.string(), // "YYYY-MM"
      cost: z.number(),
      revenue: z.number(),
      profit: z.number(),
      observation: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
