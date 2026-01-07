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
import {retry} from 'genkit/experimental/retries';

const GenerateTrainingModuleInputSchema = z.object({
  topic: z.string().describe('The topic of the training module.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the training module.'),
  targetRole: z.string().describe('The target role for the training module.'),
});

export type GenerateTrainingModuleInput = z.infer<typeof GenerateTrainingModuleInputSchema>;

const GenerateTrainingModuleOutputSchema = z.object({
  title: z.string().describe('The title of the training module.'),
  content: z.string().describe('The content of the training module.'),
  quiz: z.string().describe('A quiz related to the training module.'),
  scenario: z.string().describe('A realistic scenario related to the training module.'),
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
  prompt: `You are an expert in creating cybersecurity training modules. Your task is to generate a training module based on the following information:

Topic: {{{topic}}}
Difficulty: {{{difficulty}}}
Target Role: {{{targetRole}}}

Module Title:
Module Content:
Quiz:
Scenario: `,
});

const generateTrainingModuleFlow = ai.defineFlow(
  {
    name: 'generateTrainingModuleFlow',
    inputSchema: GenerateTrainingModuleInputSchema,
    outputSchema: GenerateTrainingModuleOutputSchema,
    experimental: {
      retry: retry(),
    },
  },
  async input => {
    const {output} = await generateTrainingModulePrompt(input);
    return output!;
  }
);
