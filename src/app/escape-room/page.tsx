'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Terminal, Key, ShieldCheck, Repeat, Loader, XCircle, CheckCircle, Wand2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { generateEscapeRoom } from '@/ai/flows/generate-escape-room-flow';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { topics } from '@/app/training/topics';
import { roles } from '@/app/training/roles';
import { industries } from '@/app/training/industries';

// Type definitions for the game steps, based on the AI flow's output schema
type GameStep = {
    step: number;
    title: string;
    scenario: string;
    options: {
        text: string;
        isCorrect: boolean;
        feedback: string;
    }[];
};

export default function EscapeRoomPage() {
    const [gameState, setGameState] = useState({
        currentStepIndex: 0,
        selectedOption: '',
        isAnswered: false,
        isCorrect: false,
        score: 0,
        isFinished: false,
    });
    
    // State for the new setup screen
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gameSteps, setGameSteps] = useState<GameStep[]>([]);
    const [setupConfig, setSetupConfig] = useState({
        difficulty: 'easy',
        category: 'Phishing Awareness',
        profession: 'Accountant',
        industry: 'Finance',
    });
    const [error, setError] = useState<string | null>(null);

    const handleStartChallenge = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateEscapeRoom(setupConfig);
            setGameSteps(result.steps);
            setIsGameStarted(true);
        } catch (err: any) {
            console.error("Failed to generate escape room:", err);
            setError("Sorry, we couldn't generate the challenge. The AI service might be busy. Please try again in a moment.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleOptionChange = (value: string) => {
        setGameState(prev => ({ ...prev, selectedOption: value }));
    };

    const handleSubmitAnswer = () => {
        const currentStepData = gameSteps[gameState.currentStepIndex];
        const chosenOption = currentStepData.options.find(opt => opt.text === gameState.selectedOption);
        if (!chosenOption) return;

        const isCorrect = chosenOption.isCorrect;
        setGameState(prev => ({
            ...prev,
            isAnswered: true,
            isCorrect,
            score: isCorrect ? prev.score + 1 : prev.score,
        }));
    };

    const handleNextStep = () => {
        if (gameState.currentStepIndex < gameSteps.length - 1) {
            setGameState(prev => ({
                ...prev,
                currentStepIndex: prev.currentStepIndex + 1,
                isAnswered: false,
                selectedOption: '',
            }));
        } else {
            setGameState(prev => ({ ...prev, isFinished: true }));
        }
    };
    
    const handleRestart = () => {
        setGameState({
            currentStepIndex: 0,
            selectedOption: '',
            isAnswered: false,
            isCorrect: false,
            score: 0,
            isFinished: false,
        });
        setGameSteps([]);
        setIsGameStarted(false);
        setError(null);
    };

    const currentStepData = isGameStarted && gameSteps.length > 0 ? gameSteps[gameState.currentStepIndex] : null;
    const progress = gameSteps.length > 0 ? ((gameState.currentStepIndex + (gameState.isFinished || (gameState.isAnswered && gameState.isCorrect) ? 1 : 0)) / gameSteps.length) * 100 : 0;
    const chosenOption = currentStepData?.options.find(opt => opt.text === gameState.selectedOption);

    const renderSetup = () => (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Key className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">Cyber Escape Room</CardTitle>
                </div>
                <CardDescription>Configure a personalized incident response challenge to test your skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="category">Cybersecurity Category</Label>
                    <Combobox
                        items={topics.map(t => ({ label: t, value: t }))}
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
                        onValueChange={(value: 'easy' | 'medium' | 'hard') => setSetupConfig(prev => ({ ...prev, difficulty: value }))}
                        disabled={isGenerating}
                    >
                        <SelectTrigger id="difficulty"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
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
                <Button onClick={handleStartChallenge} disabled={isGenerating || !setupConfig.profession || !setupConfig.industry}>
                    {isGenerating ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    {isGenerating ? 'Generating Challenge...' : 'Start Challenge'}
                </Button>
            </CardFooter>
        </Card>
    );

    const renderGame = () => (
        <Card className="max-w-3xl mx-auto overflow-hidden">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Key className="w-6 h-6 text-primary"/>
                    <CardTitle className="font-headline text-2xl">Cyber Escape Room</CardTitle>
                </div>
                <CardDescription>An incident has occurred. Solve the puzzles to regain control.</CardDescription>
                <Progress value={progress} className="mt-4" />
            </CardHeader>
            <AnimatePresence mode="wait">
                <motion.div
                    key={gameState.currentStepIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {gameState.isFinished ? (
                         <CardContent className="text-center p-8">
                            <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
                            <h2 className="text-2xl font-bold font-headline mb-2">System Restored!</h2>
                            <p className="text-muted-foreground mb-4">You have successfully navigated the incident and secured the system.</p>
                            <p className="text-lg">Your final score: <span className="font-bold text-primary">{gameState.score} / {gameSteps.length}</span></p>
                        </CardContent>
                    ) : currentStepData && (
                         <CardContent className="space-y-6">
                            <div className="p-4 bg-muted/50 border-l-4 border-primary rounded-r-lg space-y-2">
                                <h3 className="font-headline text-lg flex items-center gap-2">
                                    <Terminal />
                                    <span>{currentStepData.title}</span>
                                </h3>
                                <p className="text-muted-foreground">{currentStepData.scenario}</p>
                            </div>

                            <div>
                                <RadioGroup value={gameState.selectedOption} onValueChange={handleOptionChange} disabled={gameState.isAnswered}>
                                    {currentStepData.options.map(option => (
                                        <div key={option.text} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option.text} id={option.text} />
                                            <Label htmlFor={option.text} className="cursor-pointer">{option.text}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            
                            {gameState.isAnswered && chosenOption && (
                                 <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className={gameState.isCorrect ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}>
                                        <CardHeader className="flex-row items-center gap-2 p-3 space-y-0">
                                            {gameState.isCorrect ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-destructive" />}
                                            <CardTitle className="text-base">{gameState.isCorrect ? 'Correct!' : 'Incorrect'}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <p className="text-sm">{chosenOption.feedback}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </CardContent>
                    )}
                </motion.div>
            </AnimatePresence>
            <CardFooter className="bg-muted/50 p-4 justify-between">
                 <Button onClick={handleRestart} variant="ghost">
                    <Repeat className="mr-2 h-4 w-4" />
                    {gameState.isFinished ? 'Play Again' : 'Restart'}
                </Button>
                 {gameState.isFinished ? null : gameState.isAnswered ? (
                    <Button onClick={handleNextStep} disabled={!gameState.isCorrect}>
                        {gameState.isCorrect ? 'Next Step' : 'Try Again on Restart'}
                    </Button>
                 ) : (
                    <Button onClick={handleSubmitAnswer} disabled={!gameState.selectedOption}>
                        Submit Answer
                    </Button>
                 )}
            </CardFooter>
        </Card>
    );
    

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {isGameStarted ? renderGame() : renderSetup()}
        </div>
    );
}
