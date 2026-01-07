'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating and storing training campaigns.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, writeBatch } from 'firebase/firestore';
import { getSdks } from '@/firebase';

const lucideIcons = [
  'ShieldCheck',
  'Target',
  'Banknote',
  'LockKeyhole',
  'Laptop',
  'AlertTriangle',
];

// Define the schema for a single training module
const TrainingModuleSchema = z.object({
  id: z
    .string()
    .describe('A unique, URL-friendly slug for the module (e.g., "phishing-basics").'),
  title: z.string().describe('The title of the training module.'),
  description: z.string().describe('A brief description of the module.'),
});

// Define the schema for a single training campaign
const TrainingCampaignSchema = z.object({
  id: z
    .string()
    .describe(
      'A unique, URL-friendly slug for the campaign (e.g., "cybersecurity-fundamentals").'
    ),
  title: z.string().describe('The title of the training campaign.'),
  description: z.string().describe('A brief description of the campaign.'),
  duration: z.string().describe('The estimated duration of the campaign (e.g., "30 days").'),
  audience: z.string().describe('The target audience for the campaign (e.g., "Everyone").'),
  modules: z
    .array(TrainingModuleSchema)
    .min(3)
    .max(5)
    .describe('An array of 3 to 5 training modules within the campaign.'),
  activities: z
    .array(z.string())
    .describe('A list of activities included in the campaign (e.g., "Phishing simulations").'),
  kpis: z
    .string()
    .describe(
      'Key Performance Indicators to measure campaign success (e.g., "Phish click rate ↓").'
    ),
  icon: z
    .enum(lucideIcons as [string, ...string[]])
    .describe('The name of a lucide-react icon for the campaign.'),
});

// Define the schema for the AI model's output
const AIOutputSchema = z.object({
  campaigns: z
    .array(TrainingCampaignSchema)
    .length(6)
    .describe('An array of exactly 6 training campaigns.'),
});


// Define input schema (currently empty, but allows for future extension)
export const GenerateAndStoreTrainingCampaignsInputSchema = z.object({});
export type GenerateAndStoreTrainingCampaignsInput = z.infer<
  typeof GenerateAndStoreTrainingCampaignsInputSchema
>;

// Define output schema for the flow's result
export const GenerateAndStoreTrainingCampaignsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type GenerateAndStoreTrainingCampaignsOutput = z.infer<
  typeof GenerateAndStoreTrainingCampaignsOutputSchema
>;

// Define the Genkit prompt
const generateCampaignsPrompt = ai.definePrompt({
  name: 'generateTrainingCampaignsPrompt',
  input: { schema: z.object({}) },
  output: { schema: AIOutputSchema },
  prompt: `You are an expert in creating comprehensive cybersecurity training programs. Your task is to generate a list of exactly 6 distinct training campaigns covering a wide range of essential cybersecurity domains.

For each campaign, provide the following:
- A unique, URL-friendly slug for the campaign ID (e.g., "phishing-defense").
- A clear and descriptive title.
- A brief description of what the campaign covers.
- An estimated duration (e.g., "30 days", "45 days").
- The target audience (e.g., "All Employees", "Finance Department", "Developers").
- An array of 3 to 5 specific training modules, each with its own unique slug ID, title, and description.
- A list of key activities (e.g., "Interactive quizzes", "Phishing simulations").
- The Key Performance Indicators (KPIs) for measuring success.
- A relevant icon name from the following list: ${lucideIcons.join(', ')}.

Ensure the campaigns cover diverse topics such as fundamentals, phishing, data privacy, secure development, incident response, and compliance.`,
});

// Define the Genkit flow
export const generateAndStoreCampaignsFlow = ai.defineFlow(
  {
    name: 'generateAndStoreTrainingCampaignsFlow',
    inputSchema: GenerateAndStoreTrainingCampaignsInputSchema,
    outputSchema: GenerateAndStoreTrainingCampaignsOutputSchema,
  },
  async () => {
    try {
      // 1. Generate campaigns using the AI model
      const { output } = await generateCampaignsPrompt({});
      if (!output || !output.campaigns) {
        throw new Error('AI failed to generate campaigns.');
      }

      // 2. Get Firestore instance
      const { firestore } = getSdks();
      const campaignsCollectionRef = collection(firestore, 'trainingCampaigns');
      const batch = writeBatch(firestore);

      // 3. Prepare batch write to Firestore
      output.campaigns.forEach((campaign) => {
        const docRef = collection(firestore, 'trainingCampaigns').doc(campaign.id);
        // Firestore doesn't store functions, so we store the icon name as a string
        const firestoreCampaign = { ...campaign, icon: campaign.icon.toString() };
        batch.set(docRef, firestoreCampaign);
      });

      // 4. Commit the batch
      await batch.commit();

      return {
        success: true,
        message: `${output.campaigns.length} campaigns were successfully generated and stored in Firestore.`,
      };
    } catch (error: any) {
      console.error('Flow Error:', error);
      return {
        success: false,
        message: error.message || 'An unknown error occurred.',
      };
    }
  }
);


// Export a wrapper function to be called from the client
export async function generateAndStoreTrainingCampaigns(
  input: GenerateAndStoreTrainingCampaignsInput
): Promise<GenerateAndStoreTrainingCampaignsOutput> {
  return generateAndStoreCampaignsFlow(input);
}