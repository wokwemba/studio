import { ShieldCheck, Target, Banknote, LockKeyhole, Laptop, AlertTriangle, type LucideIcon } from "lucide-react";

export type TrainingModule = {
  id: string;
  title: string;
  description: string;
};

export type TrainingCampaign = {
  id: string;
  title: string;
  description: string;
  duration: string;
  audience: string;
  modules: TrainingModule[];
  activities: string[];
  kpis: string;
  icon: LucideIcon;
};

export const trainingCampaigns: TrainingCampaign[] = [
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description: "Essential cybersecurity principles for all employees.",
    duration: "30 days",
    audience: "Everyone",
    modules: [
      { id: "cyber-basics", title: "Cybersecurity Basics", description: "An introduction to core concepts." },
      { id: "threat-landscape", title: "Threat Landscape Overview", description: "Understanding common cyber threats." },
      { id: "shared-responsibility", title: "Shared Responsibility", description: "The role everyone plays in security." },
      { id: "acceptable-use", title: "Acceptable Use & Policies", description: "Guidelines for using company resources." },
    ],
    activities: ["5–7 min videos", "1 phishing baseline test", "End-of-campaign quiz"],
    kpis: "Quiz score ≥ 80%, Phish reporting rate",
    icon: ShieldCheck,
  },
  {
    id: "phishing-bec-social-engineering",
    title: "Phishing, BEC & Social Engineering",
    description: "Defend against deceptive attacks targeting people.",
    duration: "45 days",
    audience: "All staff (Finance & Exec focus)",
    modules: [
      { id: "phishing-spear-phishing", title: "Phishing & Spear Phishing", description: "Recognizing and reporting phishing attempts." },
      { id: "ceo-fraud", title: "CEO Fraud", description: "Guarding against executive impersonation." },
      { id: "invoice-redirection", title: "Invoice Redirection", description: "Spotting fake payment requests." },
      { id: "ai-generated-phishing", title: "AI-Generated Phishing", description: "The new wave of AI-powered threats." },
    ],
    activities: ["Monthly phishing simulations", "Real-world fraud scenarios", "Reporting drills"],
    kpis: "Phish click rate ↓, Time-to-report ↓",
    icon: Target,
  },
  {
    id: "fraud-risk-financial-protection",
    title: "Fraud Risk & Financial Protection",
    description: "Protecting financial assets from cyber-enabled fraud.",
    duration: "60 days",
    audience: "Finance, Procurement, HR, Management",
    modules: [
        { id: "cyber-enabled-fraud", title: "Cyber-Enabled Fraud", description: "How technology facilitates financial crime." },
        { id: "payment-payroll-fraud", title: "Payment & Payroll Fraud", description: "Securing payment and payroll systems." },
        { id: "vendor-fraud", title: "Vendor Fraud", description: "Managing risks from third-party vendors." },
        { id: "insider-fraud", title: "Insider Fraud", description: "Detecting and preventing internal fraudulent activities." },
    ],
    activities: ["Case-based learning", "Approval workflow simulations", "Fraud response tabletop exercise"],
    kpis: "Fraud detection accuracy, Policy compliance rate",
    icon: Banknote,
  },
  {
    id: "data-protection-privacy",
    title: "Data Protection & Privacy",
    description: "Handling data responsibly and in compliance with regulations.",
    duration: "30 days",
    audience: "All staff",
    modules: [
      { id: "data-classification", title: "Data Classification", description: "Understanding data sensitivity levels." },
      { id: "pii-handling", title: "PII Handling", description: "Safeguarding Personally Identifiable Information." },
      { id: "secure-sharing", title: "Secure Sharing", description: "Methods for sharing data securely." },
      { id: "privacy-laws", title: "Privacy Laws", description: "Overview of key privacy regulations." },
    ],
    activities: ["DLP scenarios", "Data handling quiz"],
    kpis: "Reduced data leakage incidents",
    icon: LockKeyhole,
  },
  {
    id: "secure-remote-work-cloud-usage",
    title: "Secure Remote Work & Cloud Usage",
    description: "Staying secure while working remotely and using cloud services.",
    duration: "45 days",
    audience: "Hybrid / Remote Staff",
    modules: [
        { id: "cloud-security-awareness", title: "Cloud Security Awareness", description: "Understanding the shared responsibility model in the cloud." },
        { id: "m365-risks", title: "Microsoft 365 Risks", description: "Common security pitfalls in Microsoft 365." },
        { id: "secure-wifi", title: "Secure Wi-Fi", description: "Best practices for using public and home Wi-Fi." },
        { id: "mobile-security", title: "Mobile Security", description: "Securing your mobile devices." },
    ],
    activities: ["Device hygiene checks", "Cloud misuse scenarios"],
    kpis: "Reduction in misconfigured cloud resources",
    icon: Laptop,
  },
  {
    id: "incident-response-insider-threats",
    title: "Incident Response & Insider Threats",
    description: "Preparing for and responding to security incidents.",
    duration: "30 days",
    audience: "All staff",
    modules: [
        { id: "what-is-an-incident", title: "What Is an Incident", description: "Defining and identifying security incidents." },
        { id: "insider-threats", title: "Insider Threats", description: "Recognizing threats from within the organization." },
        { id: "reporting-channels", title: "Reporting Channels", description: "How and when to report a security concern." },
    ],
    activities: ["Incident reporting drill", "Insider threat awareness quiz"],
    kpis: "Improved incident reporting times",
    icon: AlertTriangle,
  },
];
