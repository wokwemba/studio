'use server';

/**
 * @fileOverview An AI flow to generate an interactive training module on AI in Cybersecurity.
 *
 * - generateAiToolsTraining: The main function to generate the training content.
 * - AiToolsTrainingResponse: The response from the AI, containing an array of training cards.
 */

import { ai } from '@/ai/genkit';
import {
  TrainingCardSchema,
  AiToolsTrainingResponseSchema,
  type AiToolsTrainingResponse,
} from './schemas/chat-schema';


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
