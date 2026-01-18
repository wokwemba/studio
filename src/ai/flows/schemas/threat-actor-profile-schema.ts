import { z } from 'genkit';

export const GenerateThreatActorProfileInputSchema = z.object({
  actorName: z.string().describe('The name of the threat actor to profile, e.g., "APT28", "FIN7", "Lazarus Group".'),
});
export type GenerateThreatActorProfileInput = z.infer<typeof GenerateThreatActorProfileInputSchema>;

const TtpSchema = z.object({
    technique: z.string().describe('The name of the technique used by the actor.'),
    mitreId: z.string().optional().describe('The corresponding MITRE ATT&CK ID, if applicable (e.g., "T1566.001").'),
    description: z.string().describe('A brief description of how the actor uses this technique.'),
});

export const GenerateThreatActorProfileOutputSchema = z.object({
  actorName: z.string().describe('The official name of the threat actor.'),
  aliases: z.array(z.string()).describe('A list of other known names for the group (e.g., "Fancy Bear", "Sofacy").'),
  summary: z.string().describe('A high-level summary of the group, their origin, and overall objectives.'),
  motivation: z.string().describe('The primary driver for the group\'s activities (e.g., Political Espionage, Financial Gain, Data Theft).'),
  targetSectors: z.array(z.string()).describe('A list of industries or sectors commonly targeted by this group.'),
  targetRegions: z.array(z.string()).describe('A list of geographical regions commonly targeted.'),
  ttps: z.array(TtpSchema).min(3).describe('An array of at least 3 key Tactics, Techniques, and Procedures (TTPs).'),
  defensiveMeasures: z.array(z.string()).min(3).describe('An array of at least 3 recommended defensive measures to counter this actor.'),
});
export type GenerateThreatActorProfileOutput = z.infer<typeof GenerateThreatActorProfileOutputSchema>;
