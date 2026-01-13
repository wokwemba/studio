'use server';

/**
 * @fileOverview An AI flow that acts as a cybersecurity tutor.
 *
 * - chatWithTutor - The main function to interact with the AI tutor.
 * - ChatWithTutorInput - The input type for the chat function.
 * - ChatWithTutorResponse - The response from the AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
    TutorResponseSchema,
    type TutorResponse,
    ChatWithTutorInputSchema,
    type ChatWithTutorInput,
} from './schemas/tutor-schema';

export async function chatWithTutor(
  input: ChatWithTutorInput
): Promise<TutorResponse> {
  return chatWithTutorFlow(input);
}


const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: ChatWithTutorInputSchema },
  output: { schema: TutorResponseSchema },
  prompt: `You are an expert AI Cybersecurity Tutor. Your role is to provide clear, concise, and accurate explanations on cybersecurity topics.

The user will provide a history of the conversation and their latest query. Your response should be helpful and directly related to their question.

Conversation History:
{{#each history}}
- {{#if (eq role 'user')}}User: {{/if}}{{#if (eq role 'model')}}Tutor: {{/if}}{{content}}
{{/each}}

User's Query: {{{query}}}

Your Response:
`,
});


const chatWithTutorFlow = ai.defineFlow(
  {
    name: 'chatWithTutorFlow',
    inputSchema: ChatWithTutorInputSchema,
    outputSchema: TutorResponseSchema,
  },
  async (input) => {
    // In a real application, you might use the conversationId to persist
    // the chat history in a database like Firestore.
    const { output } = await tutorPrompt(input);
    return output!;
  }
);
