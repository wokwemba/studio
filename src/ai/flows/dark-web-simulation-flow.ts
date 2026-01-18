'use server';

import { ai } from '@/ai/genkit';
import {
    DarkWebSimulationInputSchema,
    type DarkWebSimulationInput,
    DarkWebSimulationOutputSchema,
    type DarkWebSimulationOutput,
} from './schemas/dark-web-simulation-schema';

export async function simulateDarkWebScan(input: DarkWebSimulationInput): Promise<DarkWebSimulationOutput> {
  return darkWebSimulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'darkWebSimulationPrompt',
  input: { schema: DarkWebSimulationInputSchema },
  output: { schema: DarkWebSimulationOutputSchema },
  prompt: `You are an AI assistant that simulates a Dark Web intelligence scan for a company. Your purpose is purely educational, to show what kind of information might be found.
  
  Given a company name and keywords, generate a *plausible but entirely fictional* report.

  - Do NOT use real breach data. Invent breach names like "ConnectSphere Leak 2023" or "DataLoom Breach".
  - Do NOT generate real passwords. Use masked passwords like 'p@ssw***' or a series of asterisks.
  - Invent plausible forum names like "CyberCrime Nexus" or "BreachBazaar".
  - Invent plausible chatter snippets.
  - Create a summary of the simulated findings and the associated risk.

  Target Company: {{{companyName}}}
  Keywords: {{{json keywords}}}
`,
});

const darkWebSimulationFlow = ai.defineFlow(
  {
    name: 'darkWebSimulationFlow',
    inputSchema: DarkWebSimulationInputSchema,
    outputSchema: DarkWebSimulationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
