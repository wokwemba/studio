'use server';

import { ai } from '@/ai/genkit';
import {
    RiskDetectionMapInputSchema,
    type RiskDetectionMapInput,
    RiskDetectionMapOutputSchema,
    type RiskDetectionMapOutput,
} from './schemas/osint-mind-map-schema';

export async function runRiskDetectionAnalysis(input: RiskDetectionMapInput): Promise<RiskDetectionMapOutput> {
  return riskDetectionMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'riskDetectionMapPrompt',
  input: { schema: RiskDetectionMapInputSchema },
  output: { schema: RiskDetectionMapOutputSchema },
  prompt: `You are an AI assistant that simulates an OSINT (Open-Source Intelligence) investigation. Given a target and a list of categories, you will generate a plausible report based on what publicly available information might exist.

First, identify if the target is an email, domain, username, or something else.

For each requested category, provide a simulated analysis. If a category is not relevant to the target type, state that. For example, 'Domain WHOIS' is not relevant for an email target.

Do NOT invent passwords or highly sensitive private data. You can invent plausible breach names, social media profile summaries, and WHOIS data. Your output must strictly follow the provided JSON schema.

Target: {{{target}}}

Categories to Investigate:
{{#each categories}}
- {{{this}}}
{{/each}}
`,
});


const riskDetectionMapFlow = ai.defineFlow(
  {
    name: 'riskDetectionMapFlow',
    inputSchema: RiskDetectionMapInputSchema,
    outputSchema: RiskDetectionMapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
