import { z } from 'zod';

export const lucideIcons = [
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
export const AIOutputSchema = z.object({
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
