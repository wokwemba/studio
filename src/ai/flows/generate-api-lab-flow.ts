'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateApiLabInputSchema,
    type GenerateApiLabInput,
    GenerateApiLabOutputSchema,
    type GenerateApiLabOutput,
} from './schemas/api-security-lab-schema';

export async function generateApiLab(input: GenerateApiLabInput): Promise<GenerateApiLabOutput> {
  return generateApiLabFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApiLabPrompt',
  input: { schema: GenerateApiLabInputSchema },
  output: { schema: GenerateApiLabOutputSchema },
  prompt: `You are an expert cybersecurity instructor specializing in API security. Your task is to create a mini hands-on lab scenario based on a given OWASP API Security Top 10 category.

The lab should be presented as a puzzle for a developer or security analyst to solve.

**OWASP Category:** {{{category}}}
{{#if profession}}**User Profession:** {{{profession}}}{{/if}}
{{#if industry}}**User Industry:** {{{industry}}}{{/if}}

**Instructions:**
1.  **Title:** Create a clear title for the lab.
2.  **Scenario:** Write a realistic scenario describing a web application and its API. If a profession and industry are provided, tailor the scenario to them.
3.  **Vulnerable Code:** Provide a concise code snippet (e.g., Node.js with Express) that contains the specific vulnerability.
4.  **Mission:** State a clear objective for the user, such as "Identify how to access data you should not be able to see."
5.  **Question:** Formulate a multiple-choice question that tests the user's understanding of how to exploit or fix the vulnerability.
6.  **Options:** Provide exactly three options. One must be correct. For each option, write clear feedback explaining why it's right or wrong.

Generate the API Security Lab now.`,
});

const generateApiLabFlow = ai.defineFlow(
  {
    name: 'generateApiLabFlow',
    inputSchema: GenerateApiLabInputSchema,
    outputSchema: GenerateApiLabOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
