import { subDays, formatISO } from 'date-fns';

export type AttackType = 'DDoS' | 'SQL Injection' | 'Cross-Site Scripting' | 'Phishing' | 'Malware' | 'Ransomware' | 'Zero-day Exploit';
export type Country = 'China' | 'Russia' | 'USA' | 'Brazil' | 'India' | 'Germany' | 'North Korea' | 'Iran' | 'Kenya' | 'Nigeria' | 'South Africa' | 'UK';

export type RecentAttack = {
  id: number;
  type: AttackType;
  source: Country;
  target: Country;
  date: string;
  description: string;
};

const attackTypes: AttackType[] = ['DDoS', 'SQL Injection', 'Cross-Site Scripting', 'Phishing', 'Malware', 'Ransomware', 'Zero-day Exploit'];
const countries: Country[] = ['China', 'Russia', 'USA', 'Brazil', 'India', 'Germany', 'North Korea', 'Iran', 'Kenya', 'Nigeria', 'South Africa', 'UK'];

const descriptions = [
    "Large-scale DDoS targeting government infrastructure.",
    "Sophisticated SQL Injection attack on a major e-commerce platform.",
    "Widespread phishing campaign impersonating a national bank.",
    "Ransomware attack on a healthcare provider, patient data compromised.",
    "Zero-day exploit discovered in widely used enterprise software.",
    "State-sponsored malware campaign targeting financial institutions.",
    "Cross-Site Scripting vulnerability exploited on a popular social media site.",
    "DDoS attack aimed at disrupting online services of a telecom company in Nairobi.",
    "Phishing scam targeting mobile banking users in Kenya.",
    "Malware found in a popular mobile application in the Google Play Store."
]

const generateRecentAttack = (id: number, daysAgo: number): RecentAttack => {
    const source = countries[Math.floor(Math.random() * countries.length)];
    let target = countries[Math.floor(Math.random() * countries.length)];
    while (source === target) {
        target = countries[Math.floor(Math.random() * countries.length)];
    }

    return {
        id,
        type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
        source,
        target,
        date: formatISO(subDays(new Date(), daysAgo)),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
    };
};

export const recentAttacksData: RecentAttack[] = Array.from({ length: 20 }, (_, i) => {
    // Distribute attacks over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    return generateRecentAttack(i + 1, daysAgo);
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Ensure at least a few attacks involve Kenya
recentAttacksData[2].target = 'Kenya';
recentAttacksData[2].source = 'Russia';
recentAttacksData[5].source = 'Kenya';
recentAttacksData[5].target = 'USA';
recentAttacksData[10].target = 'Kenya';
recentAttacksData[10].description = "DDoS attack aimed at disrupting online services of a telecom company in Nairobi.";
recentAttacksData[15].source = 'China';
recentAttacksData[15].target = 'Kenya';
