'use server';

/**
 * @fileOverview An AI agent that provides risk advice to users based on their risk profile.
 *
 * - provideAiRiskAdvice - A function that provides AI-driven advice based on a user's risk profile.
 * - ProvideAiRiskAdviceInput - The input type for the provideAiRiskAdvice function.
 * - ProvideAiRiskAdviceOutput - The return type for the provideAiRiskAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiRiskAdviceInputSchema = z.object({
  riskProfile: z
    .string()
    .describe(
      'A description of the user risk profile, including weak areas such as phishing detection and MFA awareness.'
    ),
});
export type ProvideAiRiskAdviceInput = z.infer<typeof ProvideAiRiskAdviceInputSchema>;

const ProvideAiRiskAdviceOutputSchema = z.object({
  advice: z.string().describe('AI-driven advice on which modules to focus on.'),
});
export type ProvideAiRiskAdviceOutput = z.infer<typeof ProvideAiRiskAdviceOutputSchema>;

export async function provideAiRiskAdvice(input: ProvideAiRiskAdviceInput): Promise<ProvideAiRiskAdviceOutput> {
  return provideAiRiskAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiRiskAdvicePrompt',
  input: {schema: ProvideAiRiskAdviceInputSchema},
  output: {schema: ProvideAiRiskAdviceOutputSchema},
  prompt: `You are an AI cybersecurity advisor. You will provide advice to the user on which training modules to focus on, based on their risk profile.

Risk Profile: {{{riskProfile}}}

Advice:`,
});

const provideAiRiskAdviceFlow = ai.defineFlow(
  {
    name: 'provideAiRiskAdviceFlow',
    inputSchema: ProvideAiRiskAdviceInputSchema,
    outputSchema: ProvideAiRiskAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
