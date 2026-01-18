'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateIrPlaybookInputSchema,
    type GenerateIrPlaybookInput,
    GenerateIrPlaybookOutputSchema,
    type GenerateIrPlaybookOutput,
} from './schemas/ir-playbook-schema';

export async function generateIrPlaybook(input: GenerateIrPlaybookInput): Promise<GenerateIrPlaybookOutput> {
  return generateIrPlaybookFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIrPlaybookPrompt',
  input: { schema: GenerateIrPlaybookInputSchema },
  output: { schema: GenerateIrPlaybookOutputSchema },
  prompt: `You are an expert cybersecurity incident response planner. Your task is to generate a detailed, actionable Incident Response (IR) playbook based on a specific incident type and organizational context.

The playbook must follow the six phases of the SANS/NIST incident response lifecycle: Preparation, Identification, Containment, Eradication, Recovery, and Post-Incident Activity (Lessons Learned).

Incident Type: {{{incidentType}}}

Organizational Context: {{{organizationalContext}}}

For each phase, provide at least three specific, actionable steps. The steps should be clear, concise, and practical for a corporate security team.
`,
});

const generateIrPlaybookFlow = ai.defineFlow(
  {
    name: 'generateIrPlaybookFlow',
    inputSchema: GenerateIrPlaybookInputSchema,
    outputSchema: GenerateIrPlaybookOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
