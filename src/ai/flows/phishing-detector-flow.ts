'use server';

/**
 * @fileOverview A Genkit flow to detect phishing attempts in emails, SMS, or links.
 *
 * - detectPhishing - The main function to call to get a phishing analysis.
 * - DetectPhishingInput - The input type for the detectPhishing function.
 * - DetectPhishingOutput - The output type for the detectPhishing function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectPhishingInputSchema = z.object({
  content: z.string().describe('The text content of the email, SMS, or the URL itself.'),
  type: z.enum(['Email', 'SMS', 'Link']).describe('The type of content being analyzed.'),
});
export type DetectPhishingInput = z.infer<typeof DetectPhishingInputSchema>;

const DetectPhishingOutputSchema = z.object({
  verdict: z.enum(['Safe', 'Suspicious', 'Malicious']).describe('The final verdict of the analysis.'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the verdict.'),
  explanation: z.string().describe('A detailed explanation of the findings and red flags.'),
  recommendation: z.string().describe('A clear recommended action for the user (e.g., "Delete this email", "Do not click this link").')
});
export type DetectPhishingOutput = z.infer<typeof DetectPhishingOutputSchema>;

export async function detectPhishing(input: DetectPhishingInput): Promise<DetectPhishingOutput> {
  return detectPhishingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectPhishingPrompt',
  input: { schema: DetectPhishingInputSchema },
  output: { schema: DetectPhishingOutputSchema },
  prompt: `You are an advanced AI phishing detection engine. Your purpose is to analyze content from emails, SMS messages, or links and determine if it is a phishing attempt.

Analyze the following content provided by the user.

Content Type: {{{type}}}
Content:
"{{{content}}}"

Based on your analysis, provide:
1.  A one-word 'verdict': 'Safe', 'Suspicious', or 'Malicious'.
2.  A 'confidenceScore' from 0-100 representing your certainty.
3.  A concise 'explanation' pointing out specific red flags (like urgency, sender mismatch, obfuscated links, grammar errors, requests for info) or positive signs.
4.  A clear, actionable 'recommendation' for the user (e.g., "It is safe to proceed," "Delete this SMS immediately," "Do not click the link and report the email.").
`,
});

const detectPhishingFlow = ai.defineFlow(
  {
    name: 'detectPhishingFlow',
    inputSchema: DetectPhishingInputSchema,
    outputSchema: DetectPhishingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
