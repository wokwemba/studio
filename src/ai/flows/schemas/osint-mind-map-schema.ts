import { z } from 'genkit';

export const RiskDetectionMapInputSchema = z.object({
  target: z.string().describe('The target for analysis (e.g., an email, domain, or username).'),
  categories: z.array(z.string()).describe('The list of categories to investigate.'),
});
export type RiskDetectionMapInput = z.infer<typeof RiskDetectionMapInputSchema>;

const FindingSchema = z.object({
    summary: z.string().describe('A one-sentence summary of the findings for this category.'),
    data: z.array(z.string()).describe('A list of specific data points, findings, or linked resources.'),
});

export const RiskDetectionMapOutputSchema = z.object({
  targetType: z.enum(['email', 'domain', 'username', 'other']).describe('The identified type of the target.'),
  emailAnalysis: FindingSchema.optional().describe('Analysis related to the email address (e.g., validity, associated accounts).'),
  domainAnalysis: FindingSchema.optional().describe('Analysis related to a domain name (e.g., WHOIS data, subdomains, related IPs).'),
  usernameAnalysis: FindingSchema.optional().describe('Analysis of where a username appears online across different platforms.'),
  breachData: FindingSchema.optional().describe('Information on appearances in known (simulated) data breaches.'),
  socialMedia: FindingSchema.optional().describe('Links to and summaries of associated social media profiles.'),
  reputation: FindingSchema.optional().describe('Overall reputation summary based on search engine results and other factors.'),
});
export type RiskDetectionMapOutput = z.infer<typeof RiskDetectionMapOutputSchema>;
