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
