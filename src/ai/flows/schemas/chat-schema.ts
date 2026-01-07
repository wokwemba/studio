import { z } from 'genkit';

// Define the schema for a single chat message
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Define the input schema for the main chat flow
export const ChatInputSchema = z.object({
  conversationId: z
    .string()
    .describe('A unique identifier for the conversation session.'),
  history: z
    .array(ChatMessageSchema)
    .describe('The history of the conversation so far.'),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

// Define the output schema from the AI model
export const ChatResponseSchema = z.object({
  history: z
    .array(ChatMessageSchema)
    .describe(
      'The full, updated history of the conversation, including the new AI response.'
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "The user's live score (0-100), adjusted based on their last answer."
    ),
});
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
