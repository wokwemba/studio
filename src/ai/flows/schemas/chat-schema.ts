import { z } from 'genkit';

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

export const AiToolsTrainingResponseSchema = z.object({
  cards: z
    .array(TrainingCardSchema)
    .length(5)
    .describe('An array of exactly 5 training cards.'),
});
export type AiToolsTrainingResponse = z.infer<typeof AiToolsTrainingResponseSchema>;
