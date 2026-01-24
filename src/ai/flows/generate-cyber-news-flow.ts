
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

**CRITICAL INSTRUCTIONS:**
1.  **Strict Timeframe:** All generated news must be from the last 3 days.
2.  **Local Context is MANDATORY:** If a region is provided (e.g., 'KE' for Kenya), you MUST include at least two news items that are specific and relevant to that region. Cite local sources like the official CERT (e.g., 'KE-CIRT/CC' for Kenya) or major regional news outlets.
3.  **Diversity:** Generate exactly 10 unique news items covering diverse topics: new vulnerabilities (invent a CVE like CVE-2024-XXXXX), data breaches, threat actor activity, new malware, and cybersecurity policy.
4.  **Structure:** Each item must have a headline, a 1-2 sentence summary, a source publication name, and a fictional but plausible link.

{{#if region}}
**Regional Focus:** {{{region}}}
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
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (error) {
        console.error(`Cyber news generation attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt >= maxRetries) {
           throw new Error("Failed to generate cyber news after multiple retries. The AI service may be temporarily unavailable.");
        }
        // Wait a moment before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    // This line should be unreachable
    throw new Error('Exhausted all retries for cyber news generation.');
  }
);
