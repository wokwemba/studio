'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateCyberNewsInputSchema,
    type GenerateCyberNewsInput,
    GenerateCyberNewsOutputSchema,
    type GenerateCyberNewsOutput,
} from './schemas/cyber-news-schema';

export async function generateCyberNews(input: GenerateCyberNewsInput): Promise<GenerateCyberNewsOutput> {
  return generateCyberNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCyberNewsPrompt',
  input: { schema: GenerateCyberNewsInputSchema },
  output: { schema: GenerateCyberNewsOutputSchema },
  prompt: `You are a cybersecurity intelligence analyst. Your task is to generate a list of 10 current, plausible, and impactful cybersecurity news headlines. The style should be professional, similar to what is found on sites like SecurityWeek, Dark Reading, and BleepingComputer.

**Instructions:**
1.  Generate exactly 10 unique news items.
2.  Each item must have a headline, a 1-2 sentence summary, a source publication name, and a fictional but plausible link.
3.  The topics should be diverse, covering areas like new vulnerabilities (invent a CVE if appropriate, e.g., CVE-2024-XXXXX), data breaches, threat actor activity, new malware strains, and cybersecurity policy.
4.  If a region is provided (e.g., 'KE' for Kenya), include at least one news item that is specific to that region, citing the local CERT or a regional news source (e.g., 'KE-CIRT/CC' for Kenya).
{{#if region}}
**Regional Focus:** {{{region}}} - Include news relevant to this area.
{{/if}}

Generate the 10 news articles now.`,
});

const generateCyberNewsFlow = ai.defineFlow(
  {
    name: 'generateCyberNewsFlow',
    inputSchema: GenerateCyberNewsInputSchema,
    outputSchema: GenerateCyberNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
