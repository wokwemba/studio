
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SmsFraudInputSchema = z.object({
  senderId: z.string().describe('The sender ID of the SMS message, e.g., MPESA or +254712345678.'),
  message: z.string().describe('The text content of the SMS message.'),
});
export type SmsFraudInput = z.infer<typeof SmsFraudInputSchema>;

export const SmsFraudOutputSchema = z.object({
  verdict: z.enum(['Low Risk', 'Medium Risk', 'High Risk']).describe('The final risk verdict of the analysis.'),
  riskScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the verdict.'),
  explanation: z.string().describe('A detailed explanation of the findings and red flags.'),
  indicators: z.array(z.string()).describe('A list of specific red flags or indicators of fraud detected.'),
  potentialFraudAmount: z.number().optional().describe('The monetary amount detected in the message if it is deemed fraudulent.'),
  currency: z.string().optional().describe('The currency of the detected amount (e.g., KES, USD).'),
});
export type SmsFraudOutput = z.infer<typeof SmsFraudOutputSchema>;

export async function detectSmsFraud(input: SmsFraudInput): Promise<SmsFraudOutput> {
  return detectSmsFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSmsFraudPrompt',
  input: { schema: SmsFraudInputSchema },
  output: { schema: SmsFraudOutputSchema },
  prompt: `You are an expert AI for detecting fraud in SMS messages, specifically tailored for the Kenyan market. Your purpose is to analyze SMS messages and determine if they are fraudulent, a scam, or a phishing attempt. Pay close attention to common tactics like fake M-PESA messages, subscription scams, or urgent requests involving money.

Analyze the following SMS message.

Sender ID: {{{senderId}}}
Message:
"{{{message}}}"

Based on your analysis, provide:
1.  A 'verdict': 'Low Risk', 'Medium Risk', or 'High Risk'.
2.  A 'riskScore' from 0-100 representing your certainty.
3.  A concise 'explanation' pointing out specific red flags (like urgency, unofficial sender IDs, suspicious links, grammatical errors, requests for personal info) or signs of legitimacy.
4.  A list of specific 'indicators' (red flags) you found.
5.  If a monetary value is mentioned in a potentially fraudulent context, extract the 'potentialFraudAmount' as a number and the 'currency' (e.g., 'KES', 'Ksh'). If no amount is found, omit these fields.
`,
});

const detectSmsFraudFlow = ai.defineFlow(
  {
    name: 'detectSmsFraudFlow',
    inputSchema: SmsFraudInputSchema,
    outputSchema: SmsFraudOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
