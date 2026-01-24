'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateCyberNewsInputSchema,
    type GenerateCyberNewsInput,
    GenerateCyberNewsOutputSchema,
    type GenerateCyberNewsOutput,
} from './schemas/cyber-news-schema';

const fallbackNews: GenerateCyberNewsOutput = {
    headlines: [
        "CISA warns of new Log4j-style vulnerability in widely used Java library.",
        "Healthcare sector targeted by 'Medusa' ransomware gang.",
        "Apple releases emergency patch for zero-day exploit in iOS.",
        "Scattered Spider APT group linked to recent casino breaches.",
        "KE-CIRT/CC issues alert on mobile banking malware spike in Kenya.",
    ]
};


export async function generateCyberNews(input: GenerateCyberNewsInput): Promise<GenerateCyberNewsOutput> {
  return generateCyberNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCyberNewsPrompt',
  input: { schema: GenerateCyberNewsInputSchema },
  output: { schema: GenerateCyberNewsOutputSchema },
  prompt: `List 7 current and impactful cybersecurity news headlines.
Rules:
- Max 15 words per item.
- Provide only the headline.
- No explanations.
- If a region is provided (e.g., 'KE' for Kenya), include at least two locally relevant threat headlines.

{{#if region}}
**Regional Focus:** {{{region}}}
{{/if}}`,
});

const generateCyberNewsFlow = ai.defineFlow(
  {
    name: 'generateCyberNewsFlow',
    inputSchema: GenerateCyberNewsInputSchema,
    outputSchema: GenerateCyberNewsOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        if (!output || !output.headlines || output.headlines.length === 0) {
            console.warn('AI returned empty or invalid news data, returning fallback.');
            return fallbackNews;
        }
        return output;
    } catch (error: any) {
        // This is a broad catch, good for handling 429 or other API errors
        console.warn(`Cyber news generation failed: ${error.message}. Returning fallback data.`);
        return fallbackNews;
    }
  }
);
