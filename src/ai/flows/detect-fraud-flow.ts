'use server';

/**
 * @fileOverview A Genkit flow to detect fraudulent content in emails, SMS, or links.
 *
 * - detectFraud - The main function to call to get a fraud analysis.
 * - DetectFraudInput - The input type for the detectFraud function.
 * - DetectFraudOutput - The output type for the detectFraud function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DetectFraudInputSchema = z.object({
  content: z.string().describe('The text content of the email, SMS, or the URL itself.'),
  type: z.enum(['Email', 'SMS', 'Link']).describe('The type of content being analyzed.'),
});
export type DetectFraudInput = z.infer<typeof DetectFraudInputSchema>;

const DetectFraudOutputSchema = z.object({
  verdict: z.enum(['Safe', 'Suspicious', 'Malicious']).describe('The final verdict of the analysis.'),
  confidenceScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the verdict.'),
  explanation: z.string().describe('A detailed explanation of the findings and red flags.'),
  recommendation: z.string().describe('A clear recommended action for the user (e.g., "Delete this email", "Do not click this link").')
});
export type DetectFraudOutput = z.infer<typeof DetectFraudOutputSchema>;

export async function detectFraud(input: DetectFraudInput): Promise<DetectFraudOutput> {
  return detectFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFraudPrompt',
  input: { schema: DetectFraudInputSchema },
  output: { schema: DetectFraudOutputSchema },
  prompt: `You are an advanced AI fraud detection engine. Your purpose is to analyze content from emails, SMS messages, or links and determine if it is fraudulent, a scam, or a phishing attempt.

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

const detectFraudFlow = ai.defineFlow(
  {
    name: 'detectFraudFlow',
    inputSchema: DetectFraudInputSchema,
    outputSchema: DetectFraudOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
