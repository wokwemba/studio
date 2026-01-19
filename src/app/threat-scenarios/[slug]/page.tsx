
'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { type Choice, type ThreatScenario } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trophy, Repeat, ArrowRight, Loader } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type GameState = {
  currentStepIndex: number;
  selectedChoiceId: string | null;
  isAnswered: boolean;
  isCorrect: boolean;
  score: number;
  isFinished: boolean;
};

export default function ScenarioPlayerPage({ params }: { params: { slug: string } }) {
  const firestore = useFirestore();
  const scenarioRef = useMemoFirebase(() => firestore ? doc(firestore, 'threat_scenarios', params.slug) : null, [firestore, params.slug]);
  const { data: scenario, isLoading } = useDoc<ThreatScenario>(scenarioRef);
  
  const [gameState, setGameState] = useState<GameState>({
    currentStepIndex: -1, // -1 indicates intro screen
    selectedChoiceId: null,
    isAnswered: false,
    isCorrect: false,
    score: 0,
    isFinished: false,
  });

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader className="w-10 h-10 animate-spin" />
        </div>
    );
  }

  if (!scenario) {
    notFound();
  }

  const currentStep = gameState.currentStepIndex >= 0 ? scenario.steps[gameState.currentStepIndex] : null;

  const handleStart = () => {
    setGameState(prev => ({ ...prev, currentStepIndex: 0 }));
  };

  const handleSelectChoice = (choiceId: string) => {
    if (gameState.isAnswered) return;
    setGameState(prev => ({ ...prev, selectedChoiceId: choiceId }));
  };

  const handleSubmit = () => {
    if (!currentStep || !gameState.selectedChoiceId) return;
    const correct = gameState.selectedChoiceId === currentStep.correctChoiceId;
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      isCorrect: correct,
      score: correct ? prev.score + scenario.scoring.pointsPerCorrect : prev.score,
    }));
  };

  const handleNextStep = () => {
    if (gameState.currentStepIndex < scenario.steps.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
        selectedChoiceId: null,
        isAnswered: false,
        isCorrect: false,
      }));
    } else {
      setGameState(prev => ({ ...prev, isFinished: true }));
    }
  };

  const handleRestart = () => {
    setGameState({
      currentStepIndex: -1,
      selectedChoiceId: null,
      isAnswered: false,
      isCorrect: false,
      score: 0,
      isFinished: false,
    });
  };

  const progress = (gameState.currentStepIndex + 1) / scenario.steps.length * 100;
  const maxScore = scenario.steps.length * scenario.scoring.pointsPerCorrect;

  const renderIntro = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">{scenario.title}</CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        <p>{scenario.introStory}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleStart} size="lg">Start Scenario</Button>
      </CardFooter>
    </motion.div>
  );

  const renderStep = (step: NonNullable<typeof currentStep>) => (
    <>
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="font-headline flex items-center gap-2">
            {/* Icons are not serializable from Firestore, so we'll omit them for now */}
            <span>{`Step ${gameState.currentStepIndex + 1}: ${step.title}`}</span>
        </CardTitle>
        <CardDescription>{step.content}</CardDescription>
      </CardHeader>
      <CardContent>
        {step.type === 'audio-challenge' && (
            <div className="my-4">
                <audio controls className="w-full">
                    <source src={step.assetUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
                 <p className="text-xs text-center text-muted-foreground mt-2">Note: Audio playback requires a valid URL in the scenario data.</p>
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
            <Button onClick={handleRestart} size="lg"><Repeat className="mr-2 h-4 w-4" /> Try Again</Button>
        </CardFooter>
    </motion.div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="max-w-3xl mx-auto min-h-[500px] flex flex-col justify-center">
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
      </Card>
    </div>
  );
}
