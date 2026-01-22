
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    SmsFraudInputSchema,
    type SmsFraudInput,
    SmsFraudOutputSchema,
    type SmsFraudOutput,
} from './schemas/sms-fraud-schema';

export async function detectSmsFraud(input: SmsFraudInput): Promise<SmsFraudOutput> {
  return detectSmsFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSmsFraudPrompt',
  input: { schema: SmsFraudInputSchema },
  output: { schema: SmsFraudOutputSchema },
  prompt: `You are an expert AI for detecting fraud in SMS messages, specifically tailored for the {{{region}}} market. Your purpose is to analyze SMS messages and determine if they are fraudulent, a scam, or a phishing attempt. Pay close attention to common tactics like fake M-PESA messages, subscription scams, or urgent requests involving money that are common in the specified region.

Analyze the following SMS message.

Sender ID: {{{senderId}}}
Message:
"{{{message}}}"
{{#if region}}Region: {{{region}}}{{/if}}

Based on your analysis, provide:
1.  A 'verdict': 'Low Risk', 'Medium Risk', or 'High Risk'.
2.  A 'riskScore' from 0-100 representing your certainty.
3.  A concise 'explanation' pointing out specific red flags (like urgency, unofficial sender IDs, suspicious links, grammatical errors, requests for personal info) or signs of legitimacy.
4.  A list of specific 'indicators' (red flags) you found.
5.  If a monetary value is mentioned in a potentially fraudulent context, extract the 'potentialFraudAmount' as a number and the 'currency' (e.g., 'KES', 'USD'). If no amount is found, omit these fields.
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
