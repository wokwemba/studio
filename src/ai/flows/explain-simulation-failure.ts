'use server';

/**
 * @fileOverview This file defines a Genkit flow to explain why a user failed a phishing simulation.
 *
 * The flow takes the content of the phishing email and the user's department as input.
 * It then uses an AI model to generate an explanation of why the user might have clicked the email.
 *
 * @exports {explainSimulationFailure} - The main function to call to get the AI explanation.
 * @exports {ExplainSimulationFailureInput} - The input type for the explainSimulationFailure function.
 * @exports {ExplainSimulationFailureOutput} - The output type for the explainSimulationFailure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSimulationFailureInputSchema = z.object({
  emailContent: z.string().describe('The content of the phishing email.'),
  userDepartment: z.string().describe('The department of the user who failed the simulation.'),
});
export type ExplainSimulationFailureInput = z.infer<typeof ExplainSimulationFailureInputSchema>;

const ExplainSimulationFailureOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation of why the user might have clicked the phishing email.'),
});
export type ExplainSimulationFailureOutput = z.infer<typeof ExplainSimulationFailureOutputSchema>;

export async function explainSimulationFailure(input: ExplainSimulationFailureInput): Promise<ExplainSimulationFailureOutput> {
  return explainSimulationFailureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSimulationFailurePrompt',
  input: {schema: ExplainSimulationFailureInputSchema},
  output: {schema: ExplainSimulationFailureOutputSchema},
  prompt: `You are an AI expert in cybersecurity, specializing in explaining why users fall for phishing emails.

  Given the content of a phishing email and the user's department, explain why a user in that department might have clicked the email.

  Email Content: {{{emailContent}}}
  User Department: {{{userDepartment}}}

  Explanation: `,
});

const explainSimulationFailureFlow = ai.defineFlow({
    name: 'explainSimulationFailureFlow',
    inputSchema: ExplainSimulationFailureInputSchema,
    outputSchema: ExplainSimulationFailureOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    // This part should be unreachable if maxRetries > 0
    throw new Error('Failed to get explanation after multiple retries.');
  }
);
