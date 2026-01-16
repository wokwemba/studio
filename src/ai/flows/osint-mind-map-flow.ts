'use server';

import { ai } from '@/ai/genkit';
import {
    OsintMindMapInputSchema,
    type OsintMindMapInput,
    OsintMindMapOutputSchema,
    type OsintMindMapOutput,
} from './schemas/osint-mind-map-schema';

export async function runOsintAnalysis(input: OsintMindMapInput): Promise<OsintMindMapOutput> {
  return osintMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'osintMindMapPrompt',
  input: { schema: OsintMindMapInputSchema },
  output: { schema: OsintMindMapOutputSchema },
  prompt: `You are an AI assistant that simulates an OSINT (Open-Source Intelligence) investigation. Given a target, you will generate a plausible report based on what publicly available information might exist.

First, identify if the target is an email, domain, username, or something else.
Then, provide a simulated analysis for the relevant categories. For example, if the target is an email, provide 'emailAnalysis', 'breachData', and 'socialMedia'. If it's a domain, provide 'domainAnalysis'.

Do NOT invent passwords or highly sensitive private data. You can invent plausible breach names, social media profile summaries, and WHOIS data. Your output must strictly follow the provided JSON schema.

Target: {{{target}}}
`,
});


const osintMindMapFlow = ai.defineFlow(
  {
    name: 'osintMindMapFlow',
    inputSchema: OsintMindMapInputSchema,
    outputSchema: OsintMindMapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
