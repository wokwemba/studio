import { z } from 'genkit';

export const WhatsappFraudInputSchema = z.object({
  sender: z.string().describe("The sender's WhatsApp number, e.g., +254712345678."),
  message: z.string().describe('The text content of the WhatsApp message.'),
  region: z.string().optional().describe('The region for which to tailor the fraud detection logic, e.g., "KE" for Kenya, "US" for United States.'),
});
export type WhatsappFraudInput = z.infer<typeof WhatsappFraudInputSchema>;

export const WhatsappFraudOutputSchema = z.object({
  verdict: z.enum(['Low Risk', 'Medium Risk', 'High Risk']).describe('The final risk verdict of the analysis.'),
  riskScore: z.number().min(0).max(100).describe('A confidence score (0-100) for the verdict.'),
  explanation: z.string().describe('A detailed explanation of the findings and red flags.'),
  indicators: z.array(z.string()).describe('A list of specific red flags or indicators of fraud detected.'),
});
export type WhatsappFraudOutput = z.infer<typeof WhatsappFraudOutputSchema>;
