'use server';

/**
 * @fileOverview An AI flow to generate an interactive training module on AI in Cybersecurity.
 *
 * - generateAiToolsTraining: The main function to generate the training content.
 * - TrainingCard: The type for a single educational card in the module.
 * - AiToolsTrainingResponse: The response from the AI, containing an array of training cards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  BrainCircuit,
  ShieldCheck,
  Zap,
  Bot,
  type LucideIcon,
  Search,
} from 'lucide-react';

export const TrainingCardSchema = z.object({
  icon: z
    .enum(['brain', 'shield', 'zap', 'bot', 'search'])
    .describe('The name of the icon to display on the card.'),
  title: z.string().describe('The title of the training card.'),
  content: z
    .string()
    .describe('The educational content for the card, formatted as a single paragraph.'),
  question: z.string().describe('A multiple-choice question to test understanding.'),
  options: z
    .array(z.string())
    .length(3)
    .describe('An array of exactly 3 possible answers for the question.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

export type TrainingCard = z.infer<typeof TrainingCardSchema>;

const AiToolsTrainingResponseSchema = z.object({
  cards: z
    .array(TrainingCardSchema)
    .length(5)
    .describe('An array of exactly 5 training cards.'),
});
export type AiToolsTrainingResponse = z.infer<typeof AiToolsTrainingResponseSchema>;


const trainingPrompt = ai.definePrompt({
  name: 'aiToolsTrainingPrompt',
  output: { schema: AiToolsTrainingResponseSchema },
  prompt: `You are an expert AI Cybersecurity Trainer. Your task is to create an interactive, infographic-style training module about the role of AI in cybersecurity.

Generate exactly 5 educational "cards". Each card must include:
1.  An icon name from this list: 'brain', 'shield', 'zap', 'bot', 'search'.
2.  A concise title.
3.  A single paragraph of educational content (3-4 sentences).
4.  A clear, multiple-choice question based *only* on the content of that card.
5.  Exactly 3 answer options.
6.  The correct answer.

The topics for the 5 cards should be:
1.  AI for Threat Detection (Use 'search' icon)
2.  AI in Phishing Simulation (Use 'bot' icon)
3.  AI for Vulnerability Management (Use 'shield' icon)
4.  AI-Powered Incident Response (Use 'zap' icon)
5.  The Future of AI in Cybersecurity (Use 'brain' icon)

Generate the full training module now.
`,
});


const generateAiToolsTrainingFlow = ai.defineFlow(
  {
    name: 'generateAiToolsTrainingFlow',
    outputSchema: AiToolsTrainingResponseSchema,
  },
  async () => {
    let attempt = 0;
    const maxRetries = 3;
    while (attempt < maxRetries) {
      try {
        const { output } = await trainingPrompt();
        if (!output || !output.cards || output.cards.length !== 5) {
            throw new Error("AI response was incomplete or malformed.");
        }
        return output;
      } catch (error) {
        console.error(`AI Tools Training generation attempt ${attempt + 1} failed:`, error);
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(
            "Failed to generate training module. The AI service may be temporarily unavailable. Please try again."
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    // This should not be reachable
    throw new Error("Exhausted all retries for AI tools training generation.");
  }
);


export async function generateAiToolsTraining(): Promise<AiToolsTrainingResponse> {
    return generateAiToolsTrainingFlow();
}