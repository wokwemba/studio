'use server';

/**
 * @fileOverview A conversational AI tutor for cybersecurity training.
 *
 * - chat: The main function to interact with the AI tutor.
 * - ChatMessage: The type for a single message in the chat history.
 * - ChatResponse: The response from the AI, including the updated history and score.
 */

import { ai } from '@/ai/genkit';
import {
  ChatInputSchema,
  ChatResponseSchema,
  type ChatInput,
  type ChatResponse,
  type ChatMessage,
} from './schemas/chat-schema';


// Define the prompt for the AI tutor
const tutorPrompt = ai.definePrompt({
  name: 'cybersecurityTutorPrompt',
  input: { schema: ChatInputSchema },
  output: { schema: ChatResponseSchema },
  prompt: `You are an expert AI Cybersecurity Tutor. Your goal is to teach users about cybersecurity in a conversational, interactive way.

You must follow these rules:
1.  **Maintain a Conversation:** Your responses should be natural and conversational, building on the user's messages.
2.  **Teach, Then Quiz:** Your primary role is to teach. First, explain a concept clearly. AFTER explaining it, you MUST ask a multiple-choice or open-ended question to test the user's understanding of THAT concept.
3.  **Evaluate and Score:** When the user answers a question, you MUST evaluate if they are correct. Update their score based on their answer. Start the score at 0. Add 10 points for a correct answer. Do not subtract points for wrong answers, but explain why they were wrong and re-teach the concept if needed before moving on.
4.  **One Question at a Time:** Do not ask a question if you have already asked one in your immediately preceding turn. First, evaluate the user's answer to the previous question.
5.  **Welcome Message:** If the user's message is "Start the conversation", you must provide a friendly welcome message, introduce yourself, explain how the chat works (teaching, quizzing, and scoring), and then present the first topic and question.
6.  **Always Respond with Full History:** Your final output MUST include the entire chat history, including the user's latest message and your new response.

The user's current score is: {{history.filter(m => m.role === 'model').slice(-1)[0]?.content.match(/Score: (\\d+)/)?.[1] ?? 0}}

Here is the current conversation history:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

User's new message: {{{message}}}

Based on the rules and the user's message, continue the conversation. If you just asked a question, evaluate the answer. If you just taught something or evaluated an answer, teach a new concept and ask a question. Provide the updated score and full chat history.
`,
});

const extractScore = (history: ChatMessage[]): number => {
    // Look backwards from the last message to find the most recent score.
    for (let i = history.length - 1; i >= 0; i--) {
        const message = history[i];
        if (message.role === 'model') {
            const scoreMatch = message.content.match(/Score: (\d+)/);
            if (scoreMatch && scoreMatch[1]) {
                return parseInt(scoreMatch[1], 10);
            }
        }
    }
    // If no score is found in the history, default to 0.
    return 0;
};


// Define the main Genkit flow
const chatFlow = ai.defineFlow(
  {
    name: 'conversationalTutorFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatResponseSchema,
  },
  async (input) => {
    // In a real application, you might use the conversationId to persist
    // the chat history in a database like Firestore.
    const { output } = await tutorPrompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from the client
export async function chat(input: ChatInput): Promise<ChatResponse> {
  // Adding a simple retry mechanism
  let attempt = 0;
  const maxRetries = 2;
  while (attempt < maxRetries) {
    try {
      const result = await chatFlow(input);
      // Ensure history is not empty and contains at least one model response
      if (!result.history || result.history.filter(m => m.role === 'model').length === 0) {
        throw new Error("AI response was empty or invalid.");
      }
      return result;
    } catch (error) {
      console.error(`Chat flow attempt ${attempt + 1} failed:`, error);
      attempt++;
      if (attempt >= maxRetries) {
        // Fallback response on final failure
        const fallbackMessage: ChatMessage = {
          role: 'model',
          content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        };
        
        // Safely extract the last known score from the input history
        const currentScore = extractScore(input.history);

        return {
          history: [...input.history, fallbackMessage],
          score: currentScore
        };
      }
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }
  // This should not be reached, but satisfies TypeScript
  throw new Error("Exhausted all retries for chat flow.");
}
