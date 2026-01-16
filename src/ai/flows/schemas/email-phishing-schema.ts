import { z } from 'genkit';

export const EmailPhishingInputSchema = z.object({
  sender: z.string().describe("The sender's email address."),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type EmailPhishingInput = z.infer<typeof EmailPhishingInputSchema>;

export const EmailPhishingOutputSchema = z.object({
  verdict: z.enum(['Low Risk', 'Medium Risk', 'High Risk', 'Malicious']).describe('The final risk verdict of the analysis.'),
  riskScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the verdict.'),
  explanation: z.string().describe('A detailed explanation of the findings and red flags.'),
  indicators: z.array(z.string()).describe('A list of specific red flags or indicators of phishing detected.'),
  recommendedAction: z.string().describe('The recommended action for the user (e.g., Delete, Report, Quarantine).'),
});
export type EmailPhishingOutput = z.infer<typeof EmailPhishingOutputSchema>;
