'use server';

import { ai } from '@/ai/genkit';
import {
    GenerateCyberNewsInputSchema,
    type GenerateCyberNewsInput,
    GenerateCyberNewsOutputSchema,
    type GenerateCyberNewsOutput,
} from './schemas/cyber-news-schema';

const fallbackNews: GenerateCyberNewsOutput = {
    articles: [
        {
            title: "CISA Issues New Advisory on Emerging Ransomware Tactics",
            summary: "A new report from the Cybersecurity and Infrastructure Security Agency warns of advanced techniques used by ransomware groups.",
            source: "CISA",
            link: "https://www.cisa.gov/",
        },
        {
            title: "Critical Zero-Day Vulnerability Discovered in Popular Web Framework",
            summary: "Developers are urged to patch immediately after a critical remote code execution vulnerability was found.",
            source: "Dark Reading",
            link: "https://www.darkreading.com/",
        },
        {
            title: "Financial Institutions Warned About Sophisticated Phishing-as-a-Service Platform",
            summary: "A new platform is making it easier for low-skilled attackers to launch convincing phishing campaigns.",
            source: "BleepingComputer",
            link: "https://www.bleepingcomputer.com/",
        },
        {
            title: "Enterprise VPN Appliances Targeted by State-Sponsored Actors",
            summary: "Multiple vulnerabilities in enterprise-grade VPNs are being actively exploited, according to a joint alert.",
            source: "CyberScoop",
            link: "https://cyberscoop.com/",
        },
        {
            title: "Local CERT Reports Increase in Mobile Banking Malware",
            summary: "The regional cybersecurity center has noted a significant uptick in malware targeting mobile banking users.",
            source: "KE-CIRT/CC",
            link: "https://ke-cirt.go.ke/",
        },
        {
            title: "Data Privacy Regulations Updated for Healthcare Sector",
            summary: "New compliance requirements have been introduced for handling patient data, with significant penalties for non-compliance.",
            source: "SecurityWeek",
            link: "https://www.securityweek.com/",
        },
        {
            title: "Supply Chain Attack Traced Back to Compromised Open-Source Library",
            summary: "A popular open-source library was found to contain malicious code, impacting thousands of downstream applications.",
            source: "The Hacker News",
            link: "https://thehackernews.com/",
        },
        {
            title: "Social Engineering on the Rise via Professional Networking Sites",
            summary: "Attackers are increasingly using professional networking platforms to gather intelligence for targeted spear-phishing attacks.",
            source: "Krebs on Security",
            link: "https://krebsonsecurity.com/",
        },
        {
            title: "AI-Powered Deepfake Scams Successfully Bypass Identity Verification",
            summary: "Security researchers demonstrate a new method of using AI to create realistic deepfakes that can fool some biometric checks.",
            source: "Wired",
            link: "https://www.wired.com/",
        },
        {
            title: "IoT Device Security Remains a Major Concern for Smart Homes",
            summary: "A new study reveals that a majority of popular smart home devices still ship with default passwords and unpatched firmware.",
            source: "TechCrunch",
            link: "https://techcrunch.com/",
        }
    ]
};


export async function generateCyberNews(input: GenerateCyberNewsInput): Promise<GenerateCyberNewsOutput> {
  return generateCyberNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCyberNewsPrompt',
  input: { schema: GenerateCyberNewsInputSchema },
  output: { schema: GenerateCyberNewsOutputSchema },
  prompt: `You are a cybersecurity intelligence analyst. Your task is to generate a list of 10 current, plausible, and impactful cybersecurity news headlines. The style should be professional, similar to what is found on sites like SecurityWeek, Dark Reading, and BleepingComputer.

**CRITICAL INSTRUCTIONS:**
1.  **Strict Timeframe:** All generated news must be from the last 3 days.
2.  **Local Context is MANDATORY:** If a region is provided (e.g., 'KE' for Kenya), you MUST include at least two news items that are specific and relevant to that region. Cite local sources like the official CERT (e.g., 'KE-CIRT/CC' for Kenya) or major regional news outlets.
3.  **Diversity:** Generate exactly 10 unique news items covering diverse topics: new vulnerabilities (invent a CVE like CVE-2024-XXXXX), data breaches, threat actor activity, new malware, and cybersecurity policy.
4.  **Structure:** Each item must have a headline, a 1-2 sentence summary, a source publication name, and a fictional but plausible link.

{{#if region}}
**Regional Focus:** {{{region}}}
{{/if}}

Generate the 10 news articles now.`,
});

const generateCyberNewsFlow = ai.defineFlow(
  {
    name: 'generateCyberNewsFlow',
    inputSchema: GenerateCyberNewsInputSchema,
    outputSchema: GenerateCyberNewsOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await prompt(input);
        if (!output || !output.articles || output.articles.length === 0) {
            console.warn('AI returned empty or invalid news data, returning fallback.');
            return fallbackNews;
        }
        return output;
    } catch (error: any) {
        // This is a broad catch. In a real app, we would inspect the error object
        // to specifically look for 429 or quota-related messages.
        console.warn(`Cyber news generation failed: ${error.message}. Returning fallback data.`);
        return fallbackNews;
    }
  }
);
