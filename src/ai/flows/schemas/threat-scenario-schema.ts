import { z } from 'genkit';

export const ThreatScenarioStepChoiceSchema = z.object({
  choiceId: z.string().describe('A unique ID for the choice (e.g., "A", "B").'),
  text: z.string().describe('The text for the multiple-choice option.'),
});

export const ThreatScenarioStepSchema = z.object({
  stepId: z.string().describe('A unique ID for the step (e.g., "step-1").'),
  title: z.string().describe('The title of this step in the challenge.'),
  content: z.string().describe('The detailed scenario or puzzle for the user to solve.'),
  type: z.enum(['multiple-choice', 'audio-challenge']).describe('The type of challenge for this step.'),
  assetUrl: z.string().url().optional().describe('URL to an image, audio, or video file for the step. For audio, generate a plausible but fake scenario where the user must listen to a file.'),
  choices: z.array(ThreatScenarioStepChoiceSchema).length(3).describe('An array of exactly 3 multiple-choice options.'),
  correctChoiceId: z.string().describe('The choiceId of the correct option.'),
  feedback: z.object({
    correct: z.string().describe('Feedback for a correct answer.'),
    incorrect: z.string().describe('Feedback for an incorrect answer.'),
  }),
});

export const GenerateThreatScenarioInputSchema = z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).describe('The difficulty level of the scenario.'),
    category: z.string().describe('The cybersecurity category for the scenario (e.g., "Ransomware Attack", "Insider Threat").'),
    profession: z.string().describe('The user\'s profession, to personalize the scenario (e.g., "IT Helpdesk", "HR Manager").'),
    industry: z.string().describe("The industry the user works in, to further tailor the scenario (e.g., 'Healthcare', 'Finance')."),
    region: z.string().describe("The user's geographical region, to add local context to the scenario (e.g., 'Kenya', 'USA').").optional(),
});

export type GenerateThreatScenarioInput = z.infer<typeof GenerateThreatScenarioInputSchema>;

export const GenerateThreatScenarioOutputSchema = z.object({
    slug: z.string().describe('A unique, URL-friendly identifier for the scenario.'),
    title: z.string().describe('The title of the threat scenario.'),
    description: z.string().describe('A brief description of the scenario.'),
    introStory: z.string().describe('The initial narrative to set the scene for the user.'),
    steps: z.array(ThreatScenarioStepSchema).min(3).max(5).describe('An array of 3 to 5 sequential steps for the scenario.'),
    scoring: z.object({
        pointsPerCorrect: z.number().describe('Points awarded for each correct answer.'),
    }),
});

export type GenerateThreatScenarioOutput = z.infer<typeof GenerateThreatScenarioOutputSchema>;
