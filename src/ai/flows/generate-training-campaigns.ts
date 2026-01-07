'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating and storing training campaigns.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, writeBatch, getFirestore } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import {
  GenerateAndStoreTrainingCampaignsInputSchema,
  GenerateAndStoreTrainingCampaignsOutputSchema,
  AIOutputSchema,
  lucideIcons
} from '@/ai/flows/schemas/training-campaigns-schema';
import type { GenerateAndStoreTrainingCampaignsInput, GenerateAndStoreTrainingCampaignsOutput } from '@/ai/flows/schemas/training-campaigns-schema';

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
  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      return await generateAndStoreCampaignsFlow(input);
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        // If it's the last attempt, re-throw the error to be caught by the caller.
        throw error;
      }
      // Wait for a short period before retrying (e.g., exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // This should theoretically not be reached if maxRetries > 0,
  // but as a fallback, return a failure response.
  return {
    success: false,
    message: 'Failed to generate and store campaigns after multiple retries.',
  };
}