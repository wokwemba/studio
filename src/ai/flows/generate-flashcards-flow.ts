'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating flashcards.
 *
 * - generateFlashcards - An asynchronous function that generates flashcards based on a topic.
 * - GenerateFlashcardsInput - The input type for the function.
 * - GenerateFlashcardsOutput - The output type for the function.
 * - Flashcard - The type for a single flashcard object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate flashcards.'),
});

export type GenerateFlashcardsInput = z.infer<
  typeof GenerateFlashcardsInputSchema
>;

const FlashcardSchema = z.object({
  question: z.string().describe('The question or term on the front of the flashcard.'),
  answer: z.string().describe('The answer or definition on the back of the flashcard.'),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;


const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z
    .array(FlashcardSchema)
    .min(5)
    .max(10)
    .describe('An array of 5 to 10 flashcards.'),
});

export type GenerateFlashcardsOutput = z.infer<
  typeof GenerateFlashcardsOutputSchema
>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const generateFlashcardsPrompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert in cybersecurity education. Your task is to generate a set of 5 to 10 flashcards for the given topic. Each flashcard must have a clear question and a concise answer.

Topic: {{{topic}}}

Generate the flashcards.
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    let attempt = 0;
    const maxRetries = 3;
    while (attempt < maxRetries) {
        try {
            const { output } = await generateFlashcardsPrompt(input);
            return output!;
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
                console.error("Flashcard generation failed after multiple retries:", error);
                throw new Error("Failed to generate flashcards. Please try again later.");
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
     throw new Error("Exhausted all retries for flashcard generation.");
  }
);
