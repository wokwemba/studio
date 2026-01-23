import { z } from 'genkit';

export const GenerateCyberNewsInputSchema = z.object({
  region: z.string().optional().describe('The geographical region to focus on for local news, e.g., "KE" for Kenya.'),
});
export type GenerateCyberNewsInput = z.infer<typeof GenerateCyberNewsInputSchema>;

const NewsArticleSchema = z.object({
    title: z.string().describe('A concise, compelling headline for the news article.'),
    summary: z.string().describe('A one-to-two sentence summary of the article.'),
    source: z.string().describe('The name of the publication, e.g., "SecurityWeek", "KE-CIRT".'),
    link: z.string().url().describe('A plausible but fictional URL to the full article.'),
});

export const GenerateCyberNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema).length(10).describe('An array of exactly 10 trending news articles.'),
});
export type GenerateCyberNewsOutput = z.infer<typeof GenerateCyberNewsOutputSchema>;
