'use server';

/**
 * @fileOverview An AI agent that provides insights about user vulnerabilities and suggests actions to improve their security posture.
 *
 * - surfaceAiInsights - A function that handles the process of surfacing AI insights.
 * - SurfaceAiInsightsInput - The input type for the surfaceAiInsights function.
 * - SurfaceAiInsightsOutput - The return type for the surfaceAiInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SurfaceAiInsightsInputSchema = z.object({
  tenantId: z.string().describe('The ID of the tenant.'),
  users: z.array(
    z.object({
      userId: z.string().describe('The ID of the user.'),
      department: z.string().describe('The department of the user.'),
      riskScore: z.number().describe('The risk score of the user.'),
      phishingFailRate: z
        .number()
        .describe('The phishing fail rate of the user.'),
      trainingCompletionRate: z
        .number()
        .describe('The training completion rate of the user.'),
    })
  ).describe('An array of user objects with their details.'),
  trainingModules: z.array(
    z.object({
      moduleId: z.string().describe('The ID of the training module.'),
      category: z.string().describe('The category of the training module.'),
      difficulty: z.string().describe('The difficulty of the training module.'),
    })
  ).describe('An array of training module objects with their details.'),
});
export type SurfaceAiInsightsInput = z.infer<typeof SurfaceAiInsightsInputSchema>;

const SurfaceAiInsightsOutputSchema = z.object({
  insights: z.array(
    z.object({
      finding: z.string().describe('The AI finding about user vulnerabilities.'),
      recommendation: z
        .string()
        .describe('The AI recommendation to improve security posture.'),
    })
  ).describe('An array of AI insights and recommendations.'),
});
export type SurfaceAiInsightsOutput = z.infer<typeof SurfaceAiInsightsOutputSchema>;

export async function surfaceAiInsights(
  input: SurfaceAiInsightsInput
): Promise<SurfaceAiInsightsOutput> {
  return surfaceAiInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'surfaceAiInsightsPrompt',
  input: {schema: SurfaceAiInsightsInputSchema},
  output: {schema: SurfaceAiInsightsOutputSchema},
  prompt: `You are an AI cybersecurity expert providing insights and recommendations to tenant admins.

  Analyze the provided user data, including risk scores, phishing fail rates, and training completion rates, to identify vulnerabilities.

  Based on the user data and training modules, provide specific findings and actionable recommendations to improve the tenant's security posture.

  The output should be an array of insights, each containing a finding and a recommendation.

  Users Data: {{{JSON.stringify(users)}}
  Training Modules: {{{JSON.stringify(trainingModules)}}}
  Tenant ID: {{{tenantId}}}

  Example Output:
  {
    "insights": [
      {
        "finding": "The finance team is highly vulnerable to invoice phishing attacks.",
        "recommendation": "Run a targeted phishing simulation for the finance team and assign refresher training on invoice fraud.",
      },
      {
        "finding": "Users with low training completion rates have significantly higher risk scores.",
        "recommendation": "Mandate completion of essential training modules for all users with risk scores above a specified threshold.",
      },
    ],
  }
  `,
});

const surfaceAiInsightsFlow = ai.defineFlow(
  {
    name: 'surfaceAiInsightsFlow',
    inputSchema: SurfaceAiInsightsInputSchema,
    outputSchema: SurfaceAiInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
