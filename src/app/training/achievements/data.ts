import { BookUser, Star, Shield, Fish, BrainCircuit, Target, type LucideIcon } from 'lucide-react';

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isEarned?: boolean;
};

export const badges: Badge[] = [
  {
    id: 'first-module',
    title: 'First Step',
    description: 'Complete your first training module.',
    icon: BookUser,
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Get a perfect score on any quiz.',
    icon: Star,
  },
  {
    id: 'phishing-spotter',
    title: 'Phishing Spotter',
    description: 'Pass a phishing simulation test.',
    icon: Fish,
  },
  {
    id: 'security-specialist',
    title: 'Security Specialist',
    description: 'Complete 5 training modules.',
    icon: Shield,
  },
  {
    id: 'ai-explorer',
    title: 'AI Explorer',
    description: 'Generate a training module using AI.',
    icon: BrainCircuit,
  },
  {
    id: 'simulation-survivor',
    title: 'Simulation Survivor',
    description: 'Successfully pass 3 different simulations.',
    icon: Target,
  },
   {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Complete all assigned training for a week.',
    icon: Star,
  },
   {
    id: 'social-engineer-pro',
    title: 'Social Engineering Pro',
    description: 'Complete the advanced social engineering course.',
    icon: Users,
  },
];
