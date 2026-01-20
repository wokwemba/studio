'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateEscapeRoomInputSchema,
    type GenerateEscapeRoomInput,
    GenerateEscapeRoomOutputSchema,
    type GenerateEscapeRoomOutput,
} from './schemas/escape-room-schema';

export async function generateEscapeRoom(input: GenerateEscapeRoomInput): Promise<GenerateEscapeRoomOutput> {
  return generateEscapeRoomFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEscapeRoomPrompt',
  input: { schema: GenerateEscapeRoomInputSchema },
  output: { schema: GenerateEscapeRoomOutputSchema },
  prompt: `You are a creative cybersecurity expert who designs engaging, story-driven "escape room" challenges. Your task is to generate a 4-step, multiple-choice challenge based on the user's choices.

The challenge should be a cohesive story where each step logically follows the last.

**User Inputs:**
- **Category:** {{{category}}}
- **Difficulty:** {{{difficulty}}}
- **User's Profession:** {{{profession}}}
- **User's Industry:** {{{industry}}}

**Instructions:**
1.  Create a scenario that is relevant to the user's **profession**, **industry**, and the chosen **category**.
2.  Tailor the complexity of the puzzles and the technical jargon to the selected **difficulty**.
3.  Generate exactly **four** sequential steps.
4.  For each step, provide a clear title, a detailed scenario, and exactly **three** multiple-choice options.
5.  One option must be correct (\`isCorrect: true\`). The other two must be incorrect but plausible (\`isCorrect: false\`).
6.  For every option, provide concise, educational feedback explaining why it's correct or incorrect.

Generate the 4-step escape room now.`,
});

const generateEscapeRoomFlow = ai.defineFlow(
  {
    name: 'generateEscapeRoomFlow',
    inputSchema: GenerateEscapeRoomInputSchema,
    outputSchema: GenerateEscapeRoomOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
