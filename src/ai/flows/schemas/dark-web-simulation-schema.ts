import { z } from 'genkit';

export const DarkWebSimulationInputSchema = z.object({
  companyName: z.string().describe('The name of the company to search for.'),
  keywords: z.array(z.string()).describe('A list of keywords to search for, such as employee emails, project names, or domains.'),
});
export type DarkWebSimulationInput = z.infer<typeof DarkWebSimulationInputSchema>;

const CredentialLeakSchema = z.object({
  email: z.string().email().describe('The exposed email address.'),
  passwordMask: z.string().describe('A masked version of the password, e.g., \'********\' or \'pass***d\'.'),
  sourceBreach: z.string().describe('The name of the simulated data breach where this was found.'),
  date: z.string().describe('The simulated date of the leak.'),
});

const BrandImpersonationSchema = z.object({
  platform: z.string().describe('The platform where the impersonation is happening (e.g., "Facebook", "Fake Domain").'),
  url: z.string().url().describe('The URL of the impersonating profile or site.'),
  description: z.string().describe('A brief description of the impersonation.'),
});

const ThreatChatterSchema = z.object({
  forum: z.string().describe('The name of the simulated dark web forum.'),
  author: z.string().describe('The username of the actor who posted the message.'),
  snippet: z.string().describe('A snippet of the relevant chatter.'),
  date: z.string().describe('The simulated date of the post.'),
});


export const DarkWebSimulationOutputSchema = z.object({
  credentialLeaks: z.array(CredentialLeakSchema).describe('A list of simulated credential leaks found.'),
  brandImpersonations: z.array(BrandImpersonationSchema).describe('A list of simulated brand impersonation instances.'),
  threatChatter: z.array(ThreatChatterSchema).describe('A list of simulated chatter mentioning the company or keywords.'),
  summary: z.string().describe('A high-level summary of the findings and overall risk exposure.'),
});
export type DarkWebSimulationOutput = z.infer<typeof DarkWebSimulationOutputSchema>;
