import { z } from 'genkit';

export const GenerateIrPlaybookInputSchema = z.object({
  incidentType: z.string().describe('The type of security incident, e.g., "Ransomware Attack," "Data Breach," "Business Email Compromise."'),
  organizationalContext: z.string().describe('Brief context about the organization, e.g., "A mid-sized e-commerce company using a hybrid cloud environment."'),
});
export type GenerateIrPlaybookInput = z.infer<typeof GenerateIrPlaybookInputSchema>;


const PlaybookPhaseSchema = z.object({
    phaseName: z.string().describe('The name of the incident response phase.'),
    steps: z.array(z.string()).min(3).describe('An array of at least 3 specific, actionable steps for this phase.'),
});

export const GenerateIrPlaybookOutputSchema = z.object({
  playbookTitle: z.string().describe('A clear and descriptive title for the playbook.'),
  incidentSummary: z.string().describe('A brief, one-paragraph summary of the incident type this playbook addresses.'),
  phases: z.array(PlaybookPhaseSchema).length(6).describe('An array of exactly six phases, following the SANS/NIST lifecycle.'),
});
export type GenerateIrPlaybookOutput = z.infer<typeof GenerateIrPlaybookOutputSchema>;
