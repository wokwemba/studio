import { z } from 'genkit';

export const GenerateThreatActorProfileInputSchema = z.object({
  categoryType: z.string().describe('The category to select an actor by (e.g., "motivation", "industry").'),
  categoryValue: z.string().describe('The specific value within the category (e.g., "Financially Motivated", "Healthcare").'),
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
