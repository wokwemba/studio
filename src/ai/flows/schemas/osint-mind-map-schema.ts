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
  targetType: z.enum(['email', 'domain', 'username', 'phone', 'other']).describe('The identified type of the target.'),
  emailAnalysis: FindingSchema.optional().describe('Analysis related to the email address (e.g., validity, associated accounts).'),
  domainAnalysis: FindingSchema.optional().describe('Analysis related to a domain name (e.g., WHOIS data, subdomains, related IPs).'),
  usernameAnalysis: FindingSchema.optional().describe('Analysis of where a username appears online across different platforms.'),
  phoneAnalysis: FindingSchema.optional().describe('Analysis related to a phone number (e.g., carrier, line type, associated accounts).'),
  breachData: FindingSchema.optional().describe('Information on appearances in known (simulated) data breaches.'),
  socialMedia: FindingSchema.optional().describe('Links to and summaries of associated social media profiles.'),
  reputation: FindingSchema.optional().describe('Overall reputation summary based on search engine results and other factors.'),
  leakedCredentials: FindingSchema.optional().describe('Simulated leaked credentials (username/password pairs).'),
  malwareSamples: FindingSchema.optional().describe('Simulated malware samples associated with the target.'),
  gitCommits: FindingSchema.optional().describe('Simulated public git commits by the target.'),
  pastebinLeaks: FindingSchema.optional().describe('Simulated mentions in public pastes.'),
  personalIdExposure: FindingSchema.optional().describe('Simulated exposure of personal ID numbers.'),
  creditCardExposure: FindingSchema.optional().describe('Simulated exposure of credit card information.'),
  exposedApiKeys: FindingSchema.optional().describe('Simulated exposed API keys.'),
  databaseDumps: FindingSchema.optional().describe('Simulated presence in database dumps.'),
  connectedIotDevices: FindingSchema.optional().describe('Simulated connected IoT devices.'),
  domainTyposquatting: FindingSchema.optional().describe('Simulated typosquatted or similar domains.'),
});
export type RiskDetectionMapOutput = z.infer<typeof RiskDetectionMapOutputSchema>;
