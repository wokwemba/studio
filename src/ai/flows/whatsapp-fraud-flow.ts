'use server';

import { ai } from '@/ai/genkit';
import { 
    WhatsappFraudInputSchema,
    type WhatsappFraudInput,
    WhatsappFraudOutputSchema,
    type WhatsappFraudOutput,
} from './schemas/whatsapp-fraud-schema';

export async function detectWhatsappFraud(input: WhatsappFraudInput): Promise<WhatsappFraudOutput> {
  return detectWhatsappFraudFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectWhatsappFraudPrompt',
  input: { schema: WhatsappFraudInputSchema },
  output: { schema: WhatsappFraudOutputSchema },
  prompt: `You are an expert AI for detecting fraud and scams in WhatsApp messages, particularly for the {{{region}}} market. Analyze the provided message and determine if it is fraudulent.

Analyze the following WhatsApp message:

Sender Number: {{{sender}}}
Message:
"{{{message}}}"
{{#if region}}Region: {{{region}}}{{/if}}

Based on your analysis, provide:
1.  A 'verdict': 'Low Risk', 'Medium Risk', or 'High Risk'.
2.  A 'riskScore' from 0-100 representing your certainty.
3.  A concise 'explanation' pointing out red flags (like job scams, prize notifications, urgent requests for money, suspicious links).
4.  A list of specific 'indicators' (red flags) you found.
`,
});

const detectWhatsappFraudFlow = ai.defineFlow(
  {
    name: 'detectWhatsappFraudFlow',
    inputSchema: WhatsappFraudInputSchema,
    outputSchema: WhatsappFraudOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
