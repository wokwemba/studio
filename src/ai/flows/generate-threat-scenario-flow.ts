'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateThreatScenarioInputSchema,
    type GenerateThreatScenarioInput,
    GenerateThreatScenarioOutputSchema,
    type GenerateThreatScenarioOutput,
} from './schemas/threat-scenario-schema';

export async function generateThreatScenario(input: GenerateThreatScenarioInput): Promise<GenerateThreatScenarioOutput> {
  return generateThreatScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThreatScenarioPrompt',
  input: { schema: GenerateThreatScenarioInputSchema },
  output: { schema: GenerateThreatScenarioOutputSchema },
  prompt: `You are an expert cybersecurity training designer who creates engaging, story-driven "Serious Game" scenarios. Your task is to generate a multi-step, multiple-choice challenge based on the user's choices.

The challenge should be a cohesive story where each step logically follows the last, simulating a real-world security incident.

**User Inputs:**
- **Category:** {{{category}}}
- **Difficulty:** {{{difficulty}}}
- **User's Profession:** {{{profession}}}
- **User's Industry:** {{{industry}}}
{{#if region}}- **Region:** {{{region}}}{{/if}}

**Instructions:**
1.  **Storytelling:** Create a scenario that is highly relevant to the user's **profession**, **industry**, and chosen **category**. Use local context from the specified **region** if provided.
2.  **Difficulty:** Tailor the complexity of the problem, the subtlety of the clues, and the technical jargon to the selected **difficulty**.
3.  **Structure:** Generate a scenario with a unique slug, a title, a short description, and a compelling intro story.
4.  **Steps:** Generate between 3 and 5 sequential steps.
5.  **Step Details:** For each step, provide a clear title, detailed content describing the situation, and exactly **three** plausible multiple-choice options.
6.  **Correctness:** One option must be correct. The other two must be incorrect but plausible distractors.
7.  **Feedback:** For every step, provide concise, educational feedback for both correct and incorrect answers.
8.  **Scoring:** Assign a point value for correct answers.
9.  **Audio Challenge:** If the category is 'Social Engineering' or 'Vishing', you may set one step's type to 'audio-challenge' and provide a placeholder URL like 'https://example.com/audio-evidence.mp3'. In the content for that step, instruct the user to listen to the audio.

Generate the Threat Scenario now.`,
});

const generateThreatScenarioFlow = ai.defineFlow(
  {
    name: 'generateThreatScenarioFlow',
    inputSchema: GenerateThreatScenarioInputSchema,
    outputSchema: GenerateThreatScenarioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
