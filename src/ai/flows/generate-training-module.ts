'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating training modules.
 *
 * - generateTrainingModule - An asynchronous function that generates a training module based on the provided input.
 * - GenerateTrainingModuleInput - The input type for the generateTrainingModule function.
 * - GenerateTrainingModuleOutput - The output type for the generateTrainingModule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrainingModuleInputSchema = z.object({
  topic: z.string().describe('The topic of the training module.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the training module.'),
  industry: z.string().describe('The industry the training is targeted at.'),
  targetRole: z.string().describe('The target role for the training module.'),
  region: z.string().describe('The geographical region for which the training is targeted, e.g., "Kenya", "European Union".').optional(),
});

export type GenerateTrainingModuleInput = z.infer<typeof GenerateTrainingModuleInputSchema>;

const GenerateTrainingModuleOutputSchema = z.object({
  title: z.string().describe('The title of the training module.'),
  sessions: z.array(z.object({
    title: z.string().describe('The title of the learning session.'),
    content: z.string().describe('The content of the learning session as a paragraph.'),
  })).length(10).describe('An array of 10 learning sessions.'),
  quiz: z.array(
    z.object({
      question: z.string().describe('The multiple-choice question.'),
      options: z.array(z.string()).describe('An array of 3-4 possible answers.'),
      correctAnswer: z.string().describe('The correct answer from the options array.'),
    })
  ).length(5).describe('A 5-question multiple-choice quiz based on the content of the sessions.'),
});

export type GenerateTrainingModuleOutput = z.infer<typeof GenerateTrainingModuleOutputSchema>;

export async function generateTrainingModule(
  input: GenerateTrainingModuleInput
): Promise<GenerateTrainingModuleOutput> {
  return generateTrainingModuleFlow(input);
}

const generateTrainingModulePrompt = ai.definePrompt({
  name: 'generateTrainingModulePrompt',
  input: {schema: GenerateTrainingModuleInputSchema},
  output: {schema: GenerateTrainingModuleOutputSchema},
  prompt: `You are an expert in creating cybersecurity training modules. Your task is to generate a concise and engaging training module based on the following information. Tailor content, examples, and legal references to be relevant for the specified region.

Topic: {{{topic}}}
Difficulty: {{{difficulty}}}
Industry: {{{industry}}}
Target Role: {{{targetRole}}}
{{#if region}}Region: {{{region}}}{{/if}}

Generate the following sections:
- Module Title: A clear and descriptive title for the whole module.
- Sessions: An array of exactly 10 learning sessions. Each session should have a title and a paragraph of content, breaking down the main topic into smaller, digestible parts.
- Quiz: A 5-question multiple-choice quiz based on the content of all 10 sessions.
`,
});

const generateTrainingModuleFlow = ai.defineFlow(
  {
    name: 'generateTrainingModuleFlow',
    inputSchema: GenerateTrainingModuleInputSchema,
    outputSchema: GenerateTrainingModuleOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const {output} = await generateTrainingModulePrompt(input);
        return output!;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    // This part should be unreachable if maxRetries > 0
    throw new Error('Failed to generate training module after multiple retries.');
  }
);
