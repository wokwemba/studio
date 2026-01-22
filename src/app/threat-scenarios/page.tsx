
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, Repeat, ArrowRight, Loader, ShieldQuestion, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { roles } from '@/app/training/roles';
import { industries } from '@/app/training/industries';
import { generateThreatScenario, type GenerateThreatScenarioOutput } from '@/ai/flows/generate-threat-scenario-flow';
import type { ThreatScenarioStep, ThreatScenarioStepChoice } from '@/ai/flows/schemas/threat-scenario-schema';
import { useFirestore, useUser } from '@/firebase';
import { saveChallengeAttempt } from '@/lib/scoring';
import { useLocale } from '@/context/LocaleContext';


const scenarioCategories = [
    { label: "Ransomware Attack", value: "Ransomware Attack" },
    { label: "Insider Threat", value: "Insider Threat" },
    { label: "Business Email Compromise (BEC)", value: "Business Email Compromise (BEC)" },
    { label: "Data Breach (External Actor)", value: "Data Breach (External Actor)" },
    { label: "Supply Chain Attack", value: "Supply Chain Attack" },
    { label: "Advanced Social Engineering", value: "Advanced Social Engineering" },
];

type GameState = {
  currentStepIndex: number;
  selectedChoiceId: string | null;
  isAnswered: boolean;
  isCorrect: boolean;
  score: number;
  isFinished: boolean;
};

export default function ThreatScenariosPage() {
  const [scenario, setScenario] = useState<GenerateThreatScenarioOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { locale } = useLocale();
  const [setupConfig, setSetupConfig] = useState({
    difficulty: 'medium' as 'easy' | 'medium' | 'hard' | 'expert',
    category: 'Ransomware Attack',
    profession: 'IT Helpdesk',
    industry: 'Technology',
  });

  const [gameState, setGameState] = useState<GameState>({
    currentStepIndex: -1, // -1 indicates intro screen, -2 means setup
    selectedChoiceId: null,
    isAnswered: false,
    isCorrect: false,
    score: 0,
    isFinished: false,
  });

  const { user } = useUser();
  const firestore = useFirestore();

  const handleGenerateScenario = async () => {
    setIsGenerating(true);
    setError(null);
    try {
        const result = await generateThreatScenario({...setupConfig, region: locale});
        setScenario(result);
        setGameState(prev => ({ ...prev, currentStepIndex: -1 })); // Move to intro screen
    } catch (err: any) {
        console.error("Failed to generate scenario:", err);
        setError("Sorry, we couldn't generate the scenario. The AI service might be busy. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, currentStepIndex: 0 }));
  };

  const handleSelectChoice = (choiceId: string) => {
    if (gameState.isAnswered) return;
    setGameState(prev => ({ ...prev, selectedChoiceId: choiceId }));
  };

  const handleSubmit = () => {
    if (!scenario || gameState.currentStepIndex < 0 || !gameState.selectedChoiceId) return;
    const currentStep = scenario.steps[gameState.currentStepIndex];
    const correct = gameState.selectedChoiceId === currentStep.correctChoiceId;
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      isCorrect: correct,
      score: correct ? prev.score + (scenario.scoring.pointsPerCorrect || 10) : prev.score,
    }));
  };

  const handleNextStep = () => {
    const isFinishing = !scenario || gameState.currentStepIndex >= scenario.steps.length - 1;
    if (isFinishing) {
        setGameState(prev => ({ ...prev, isFinished: true }));
        if (user && firestore && scenario) {
            const maxScore = scenario.steps.length * (scenario.scoring.pointsPerCorrect || 10);
            saveChallengeAttempt(firestore, user, {
                challengeType: 'threat-scenario',
                challengeName: scenario.title,
                score: gameState.score,
                maxScore: maxScore,
                percentage: (gameState.score / maxScore) * 100,
            });
        }
        return;
    }
    setGameState(prev => ({
      ...prev,
      currentStepIndex: prev.currentStepIndex + 1,
      selectedChoiceId: null,
      isAnswered: false,
      isCorrect: false,
    }));
  };

  const handleRestart = () => {
    setScenario(null);
    setError(null);
    setGameState({
      currentStepIndex: -1,
      selectedChoiceId: null,
      isAnswered: false,
      isCorrect: false,
      score: 0,
      isFinished: false,
    });
  };

  const currentStep = (scenario && gameState.currentStepIndex >= 0) ? scenario.steps[gameState.currentStepIndex] : null;
  const progress = scenario ? (gameState.currentStepIndex + 1) / scenario.steps.length * 100 : 0;
  const maxScore = scenario ? scenario.steps.length * (scenario.scoring.pointsPerCorrect || 10) : 0;


  const renderSetup = () => (
    <Card className="max-w-3xl mx-auto">
        <CardHeader>
            <div className="flex items-center gap-2 mb-2">
                <ShieldQuestion className="w-6 h-6 text-primary"/>
                <CardTitle className="font-headline text-2xl">Interactive Threat Scenarios</CardTitle>
            </div>
            <CardDescription>Generate a personalized, story-driven security challenge to test your decision-making skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label htmlFor="category">Threat Category</Label>
                <Combobox
                    items={scenarioCategories}
                    value={setupConfig.category}
                    onChange={(value) => setSetupConfig(prev => ({ ...prev, category: value }))}
                    placeholder="Select a category..."
                    searchPlaceholder="Search categories..."
                    notfoundText="No category found."
                    disabled={isGenerating}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                    value={setupConfig.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard' | 'expert') => setSetupConfig(prev => ({ ...prev, difficulty: value }))}
                    disabled={isGenerating}
                >
                    <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="industry">Your Industry</Label>
                    <Combobox
                        items={industries.map(i => ({ label: i, value: i }))}
                        value={setupConfig.industry}
                        onChange={(value) => setSetupConfig(prev => ({ ...prev, industry: value }))}
                        placeholder="Select an industry..."
                        searchPlaceholder="Search industries..."
                        notfoundText="No industry found."
                        disabled={isGenerating}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="profession">Your Profession</Label>
                    <Combobox
                        items={roles.map(r => ({ label: r, value: r }))}
                        value={setupConfig.profession}
                        onChange={(value) => setSetupConfig(prev => ({ ...prev, profession: value }))}
                        placeholder="Select a profession..."
                        searchPlaceholder="Search professions..."
                        notfoundText="No profession found."
                        disabled={isGenerating}
                    />
                </div>
            </div>
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </CardContent>
        <CardFooter>
            <Button onClick={handleGenerateScenario} disabled={isGenerating}>
                {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generating Scenario...' : 'Generate Scenario'}
            </Button>
        </CardFooter>
    </Card>
  );

  const renderIntro = () => scenario && (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">{scenario.title}</CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p>{scenario.introStory}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStartGame} size="lg">Start Scenario</Button>
      </CardFooter>
    </motion.div>
  );

  const renderStep = (step: ThreatScenarioStep) => (
    <>
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="font-headline flex items-center gap-2">
            <span>{`Step ${gameState.currentStepIndex + 1}: ${step.title}`}</span>
        </CardTitle>
        <CardDescription>{step.content}</CardDescription>
      </CardHeader>
      <CardContent>
        {step.type === 'audio-challenge' && step.assetUrl && (
            <div className="my-4">
                <audio controls className="w-full">
                    <source src={step.assetUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        )}
        <RadioGroup
          value={gameState.selectedChoiceId || ''}
          onValueChange={handleSelectChoice}
          disabled={gameState.isAnswered}
        >
          {step.choices.map((choice) => (
            <div key={choice.choiceId} className="flex items-center space-x-2">
              <RadioGroupItem value={choice.choiceId} id={choice.choiceId} />
              <Label htmlFor={choice.choiceId} className="flex-1 cursor-pointer">{choice.text}</Label>
            </div>
          ))}
        </RadioGroup>
        
        {gameState.isAnswered && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
            >
                <Card className={gameState.isCorrect ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}>
                    <CardHeader className="flex-row items-center gap-2 p-3 space-y-0">
                        {gameState.isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
                        <CardTitle className="text-base">{gameState.isCorrect ? 'Correct!' : 'Incorrect'}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <p className="text-sm">{gameState.isCorrect ? step.feedback.correct : step.feedback.incorrect}</p>
                    </CardContent>
                </Card>
            </motion.div>
        )}

      </CardContent>
      <CardFooter>
        {!gameState.isAnswered ? (
          <Button onClick={handleSubmit} disabled={!gameState.selectedChoiceId}>Submit Answer</Button>
        ) : (
          <Button onClick={handleNextStep}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
        )}
      </CardFooter>
    </>
  );

  const renderFinish = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <CardHeader>
            <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl font-headline">Scenario Complete</CardTitle>
            <CardDescription>You have successfully completed the scenario.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-5xl font-bold">{gameState.score} <span className="text-2xl text-muted-foreground">/ {maxScore}</span></p>
            <p className="text-lg text-muted-foreground">Points</p>
        </CardContent>
        <CardFooter className="justify-center">
            <Button onClick={handleRestart} size="lg"><Repeat className="mr-2 h-4 w-4" /> New Scenario</Button>
        </CardFooter>
    </motion.div>
  );
  
  const renderContent = () => {
    if (isGenerating) {
        return (
            <CardContent className="p-8 flex flex-col items-center justify-center gap-4 min-h-[500px]">
                <Loader className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">AI is crafting your threat scenario...</p>
            </CardContent>
        )
    }

    if (!scenario) {
        return renderSetup();
    }
    
    return (
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.isFinished ? 'finished' : gameState.currentStepIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {gameState.currentStepIndex === -1 ? renderIntro() : gameState.isFinished ? renderFinish() : currentStep && renderStep(currentStep)}
          </motion.div>
        </AnimatePresence>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {scenario ? (
        <Card className="max-w-3xl mx-auto min-h-[500px] flex flex-col justify-center">
            {renderContent()}
        </Card>
      ) : renderContent()}
    </div>
  );
}
