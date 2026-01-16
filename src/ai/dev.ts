import { config } from 'dotenv';
config();

import '@/ai/flows/generate-training-module.ts';
import '@/ai/flows/explain-simulation-failure.ts';
import '@/aiflows/provide-ai-risk-advice.ts';
import '@/ai/flows/surface-ai-insights.ts';
import '@/ai/flows/generate-training-campaigns.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/generate-flashcards-flow.ts';
import '@/ai/flows/phishing-detector-flow.ts';
import '@/ai/genkit';
import '@/ai/flows/schemas/tutor-schema.ts';
