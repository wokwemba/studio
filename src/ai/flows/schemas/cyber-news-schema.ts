import { z } from 'genkit';

export const GenerateCyberNewsInputSchema = z.object({
  region: z.string().optional().describe('The geographical region to focus on for local news, e.g., "KE" for Kenya.'),
});
export type GenerateCyberNewsInput = z.infer<typeof GenerateCyberNewsInputSchema>;

export const GenerateCyberNewsOutputSchema = z.object({
  headlines: z.array(z.string()).max(10).describe('An array of up to 10 trending news headlines.'),
});
export type GenerateCyberNewsOutput = z.infer<typeof GenerateCyberNewsOutputSchema>;