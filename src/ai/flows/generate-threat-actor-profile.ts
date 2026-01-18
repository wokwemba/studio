'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateThreatActorProfileInputSchema,
    type GenerateThreatActorProfileInput,
    GenerateThreatActorProfileOutputSchema,
    type GenerateThreatActorProfileOutput,
} from './schemas/threat-actor-profile-schema';

export async function generateThreatActorProfile(input: GenerateThreatActorProfileInput): Promise<GenerateThreatActorProfileOutput> {
  return generateThreatActorProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThreatActorProfilePrompt',
  input: { schema: GenerateThreatActorProfileInputSchema },
  output: { schema: GenerateThreatActorProfileOutputSchema },
  prompt: `You are a senior threat intelligence analyst. Your task is to generate a detailed profile of a well-known cyber threat actor (APT group, cybercrime gang, etc.).

Provide a comprehensive but concise summary. The information should be based on publicly available threat intelligence.

Threat Actor Name: {{{actorName}}}

Generate the profile including:
- A brief summary of the group.
- Their primary motivations (e.g., espionage, financial gain).
- Common target sectors and regions.
- A list of their key Tactics, Techniques, and Procedures (TTPs), mapping them to MITRE ATT&CK IDs where possible (e.g., "Phishing (T1566)").
- Recommended defensive measures and mitigations specific to this actor's TTPs.
`,
});

const generateThreatActorProfileFlow = ai.defineFlow(
  {
    name: 'generateThreatActorProfileFlow',
    inputSchema: GenerateThreatActorProfileInputSchema,
    outputSchema: GenerateThreatActorProfileOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
