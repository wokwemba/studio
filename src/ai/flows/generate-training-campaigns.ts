'use server';

/**
 * @fileOverview A Genkit flow to generate a training campaign based on a given topic.
 *
 * This flow takes a topic as input and uses an AI model to create a structured training campaign,
 * including a title, description, duration, audience, modules, activities, and KPIs.
 *
 * @exports generateTrainingCampaigns - The main function to generate a training campaign.
 * @exports GenerateTrainingCampaignsInput - The input type for the generation function.
 * @exports GenerateTrainingCampaignsOutput - The output type for the generation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateTrainingCampaignsInputSchema = z.object({
  topic: z.string().describe('The topic for the training campaign.'),
});
export type GenerateTrainingCampaignsInput = z.infer<
  typeof GenerateTrainingCampaignsInputSchema
>;

const GenerateTrainingCampaignsOutputSchema = z.object({
  title: z.string().describe('The title of the training campaign.'),
  description: z.string().describe('A description of the training campaign.'),
  duration: z.string().describe('The duration of the training campaign (e.g., "4 weeks").'),
  audience: z.string().describe('The target audience for the campaign (e.g., "All Employees").'),
  modules: z.array(
    z.object({
      id: z.string().describe('A unique ID for the module (e.g., "M01").'),
      title: z.string().describe('The title of the training module.'),
      description: z.string().describe('A brief description of the module.'),
    })
  ).min(3).describe('An array of at least 3 training modules.'),
  activities: z
    .array(z.string())
    .min(2)
    .describe(
      'An array of at least 2 engagement activities (e.g., "Weekly Quiz," "Phishing Simulation").'
    ),
  kpis: z.string().describe('Key Performance Indicators to measure the campaign\'s success.'),
});
export type GenerateTrainingCampaignsOutput = z.infer<
  typeof GenerateTrainingCampaignsOutputSchema
>;

export async function generateTrainingCampaigns(
  input: GenerateTrainingCampaignsInput
): Promise<GenerateTrainingCampaignsOutput> {
  return generateTrainingCampaignsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrainingCampaignsPrompt',
  input: { schema: GenerateTrainingCampaignsInputSchema },
  output: { schema: GenerateTrainingCampaignsOutputSchema },
  prompt: `You are an expert in designing cybersecurity training campaigns. Based on the provided topic, create a comprehensive training campaign.

Topic: {{{topic}}}

Generate a full campaign structure including a title, description, duration, target audience, a list of at least 3 training modules, at least 2 activities, and relevant KPIs.
`,
});

const generateTrainingCampaignsFlow = ai.defineFlow(
  {
    name: 'generateTrainingCampaignsFlow',
    inputSchema: GenerateTrainingCampaignsInputSchema,
    outputSchema: GenerateTrainingCampaignsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
