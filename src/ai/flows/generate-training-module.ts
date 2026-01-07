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
  targetRole: z.string().describe('The target role for the training module.'),
});

export type GenerateTrainingModuleInput = z.infer<typeof GenerateTrainingModuleInputSchema>;

const GenerateTrainingModuleOutputSchema = z.object({
  title: z.string().describe('The title of the training module.'),
  content: z.string().describe('The content of the training module as a series of paragraphs. Use newline characters for separation.'),
  quiz: z.string().describe(`A multiple-choice quiz with 3-5 questions related to the training module content. 
    Each question must be separated by '---'. 
    For each question, provide the question, 3-4 options prefixed with '-', and the correct answer prefixed with 'Correct Answer: '.
    Example:
    Question: What is phishing?
    - A type of food
    - A fraudulent attempt to obtain sensitive information
    - A fishing video game
    Correct Answer: A fraudulent attempt to obtain sensitive information
    ---
    Question: What is a strong password?
    - 123456
    - password
    - A complex combination of letters, numbers, and symbols
    Correct Answer: A complex combination of letters, numbers, and symbols
    `),
  scenario: z.string().describe('A realistic scenario related to the training module. Use newline characters for separation.'),
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
  prompt: `You are an expert in creating cybersecurity training modules. Your task is to generate a concise and engaging training module based on the following information:

Topic: {{{topic}}}
Difficulty: {{{difficulty}}}
Target Role: {{{targetRole}}}

Generate the following sections:
- Module Title: A clear and descriptive title.
- Module Content: 2-3 paragraphs explaining the core concepts.
- Scenario: A short, realistic scenario illustrating the topic.
- Quiz: A 3-question multiple-choice quiz based on the content and scenario.
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
