'use server';

import { ai } from '@/ai/genkit';
import { 
    EmailPhishingInputSchema,
    type EmailPhishingInput,
    EmailPhishingOutputSchema,
    type EmailPhishingOutput,
} from './schemas/email-phishing-schema';

export async function detectEmailPhishing(input: EmailPhishingInput): Promise<EmailPhishingOutput> {
  return detectEmailPhishingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectEmailPhishingPrompt',
  input: { schema: EmailPhishingInputSchema },
  output: { schema: EmailPhishingOutputSchema },
  prompt: `You are an expert AI for detecting phishing, scams, and malicious content in emails. Analyze the provided email content and provide a detailed risk assessment.

Analyze the following email:

Sender: {{{sender}}}
Subject: {{{subject}}}
Body:
"{{{body}}}"

Based on your analysis, provide:
1.  A 'verdict': 'Low Risk', 'Medium Risk', 'High Risk', or 'Malicious'.
2.  A 'riskScore' from 0-100 representing your certainty.
3.  A concise 'explanation' pointing out specific red flags like suspicious links, urgency, grammatical errors, sender impersonation, or unusual attachments.
4.  A list of specific 'indicators' (red flags) you found.
5.  A clear 'recommendedAction' for the end-user, such as 'Safely delete this email', 'Report as phishing', or 'Do not click any links or open attachments'.
`,
});

const detectEmailPhishingFlow = ai.defineFlow(
  {
    name: 'detectEmailPhishingFlow',
    inputSchema: EmailPhishingInputSchema,
    outputSchema: EmailPhishingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
