import { z } from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatWithTutorInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  query: z.string(),
  conversationId: z.string().optional(),
});
export type ChatWithTutorInput = z.infer<typeof ChatWithTutorInputSchema>;


export const TutorResponseSchema = z.object({
    response: z.string().describe("The AI tutor's response to the user's query."),
});
export type TutorResponse = z.infer<typeof TutorResponseSchema>;
