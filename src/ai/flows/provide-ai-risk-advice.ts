'use server';

/**
 * @fileOverview An AI agent that provides risk advice to users based on their risk profile.
 *
 * - provideAiRiskAdvice - A function that provides AI-driven advice based on a user's risk profile.
 * - ProvideAiRiskAdviceInput - The input type for the provideAiRiskAdvice function.
 * - ProvideAiRiskAdviceOutput - The return type for the provideAiRiskAdvice function
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProvideAiRiskAdviceInputSchema = z.object({
  riskProfile: z
    .string()
    .describe('A description of the user\'s risk profile.'),
});

export type ProvideAiRiskAdviceInput = z.infer<
  typeof ProvideAiRiskAdviceInputSchema
>;

const ProvideAiRiskAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('The AI-driven advice to improve the user\'s security posture.'),
});

export type ProvideAiRiskAdviceOutput = z.infer<
  typeof ProvideAiRiskAdviceOutputSchema
>;

export async function provideAiRiskAdvice(
  input: ProvideAiRiskAdviceInput
): Promise<ProvideAiRiskAdviceOutput> {
  return provideAiRiskAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiRiskAdvicePrompt',
  input: { schema: ProvideAiRiskAdviceInputSchema },
  output: { schema: ProvideAiRiskAdviceOutputSchema },
  prompt: `You are an AI cybersecurity advisor. Your task is to provide actionable advice to a user based on their risk profile.

The advice should be concise, easy to understand, and directly related to the user's vulnerabilities.

User's Risk Profile: {{{riskProfile}}}

Provide your advice.`,
});

const provideAiRiskAdviceFlow = ai.defineFlow(
  {
    name: 'provideAiRiskAdviceFlow',
    inputSchema: ProvideAiRiskAdviceInputSchema,
    outputSchema: ProvideAiRiskAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
