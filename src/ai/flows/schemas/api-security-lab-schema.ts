import { z } from 'genkit';

export const GenerateApiLabInputSchema = z.object({
  category: z.string().describe('The OWASP API Security Top 10 category for the lab.'),
});
export type GenerateApiLabInput = z.infer<typeof GenerateApiLabInputSchema>;

export const ApiLabOptionSchema = z.object({
  text: z.string().describe('The text for the multiple-choice option.'),
  isCorrect: z.boolean().describe('Whether this is the correct answer.'),
  feedback: z.string().describe('The feedback explaining why this option is correct or incorrect.'),
});

export const GenerateApiLabOutputSchema = z.object({
  title: z.string().describe('The title of the API security lab challenge.'),
  scenario: z.string().describe('A detailed scenario explaining the context of the vulnerability.'),
  vulnerableCode: z.string().describe('A snippet of code (e.g., JavaScript/Node.js, Python) containing the vulnerability. It should be formatted as a string.'),
  mission: z.string().describe('A clear mission objective for the user.'),
  question: z.string().describe('The multiple-choice question the user must answer to complete the mission.'),
  options: z.array(ApiLabOptionSchema).length(3).describe('An array of exactly 3 multiple-choice options.'),
});

export type GenerateApiLabOutput = z.infer<typeof GenerateApiLabOutputSchema>;
