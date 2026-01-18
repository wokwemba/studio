
import { type LucideIcon } from 'lucide-react';

export type Choice = {
    choiceId: string;
    text: string;
};

export type ScenarioStep = {
    stepId: string;
    title: string;
    content: string;
    type: 'multiple-choice' | 'audio-challenge';
    assetUrl?: string;
    icon?: LucideIcon;
    choices: Choice[];
    correctChoiceId: string;
    feedback: {
        correct: string;
        incorrect: string;
    };
};

export type ThreatScenario = {
    slug: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    introStory: string;
    steps: ScenarioStep[];
    scoring: {
        pointsPerCorrect: number;
    };
};
