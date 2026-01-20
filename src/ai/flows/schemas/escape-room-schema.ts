import { z } from 'genkit';

export const EscapeRoomStepSchema = z.object({
  step: z.number().describe('The step number, starting from 1.'),
  title: z.string().describe('The title of this step in the challenge.'),
  scenario: z.string().describe('The detailed scenario or puzzle for the user to solve.'),
  options: z.array(z.object({
    text: z.string().describe('The text for a multiple-choice option.'),
    isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
    feedback: z.string().describe('The feedback to show the user after they choose this option.'),
  })).length(3).describe('An array of exactly 3 multiple-choice options.'),
});

export const GenerateEscapeRoomInputSchema = z.object({
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the challenge.'),
    category: z.string().describe('The cybersecurity category for the challenge (e.g., "Network Security", "Phishing").'),
    profession: z.string().describe('The user\'s profession, to personalize the scenario (e.g., "Software Developer", "Accountant").'),
});

export type GenerateEscapeRoomInput = z.infer<typeof GenerateEscapeRoomInputSchema>;

export const GenerateEscapeRoomOutputSchema = z.object({
    steps: z.array(EscapeRoomStepSchema).length(4).describe('An array of exactly 4 steps for the escape room challenge.'),
});

export type GenerateEscapeRoomOutput = z.infer<typeof GenerateEscapeRoomOutputSchema>;
