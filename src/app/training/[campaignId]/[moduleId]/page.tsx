'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  generateTrainingModule,
  GenerateTrainingModuleOutput,
} from '@/ai/flows/generate-training-module';
import { Loader, Check, X as Wrong, ArrowLeft, ArrowRight } from 'lucide-react';
import { trainingCampaigns } from '@/app/training/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
};

type TrainingSession = {
  title: string;
  content: string;
};

type TrainingModuleWithSessions = Omit<GenerateTrainingModuleOutput, 'quiz'> & {
  quiz: QuizQuestion[];
};

function parseQuiz(quizString: string): QuizQuestion[] {
  try {
    const questions = quizString.split('---').filter(q => q.trim().length > 0);
    return questions.map(q => {
      const lines = q.trim().split('\n');
      const question = lines[0].replace('Question: ', '');
      const options = lines.slice(1, -1).map(opt => opt.replace(/^- /, ''));
      const correctAnswer = lines[lines.length - 1].replace('Correct Answer: ', '');
      return { question, options, correctAnswer };
    });
  } catch (error) {
    console.error("Failed to parse quiz:", error);
    return [];
  }
}

function formatIdToTitle(id: string) {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}


export default function TrainingModulePage({ params: paramsProp }: { params: { campaignId: string; moduleId: string } }) {
  const params = use(paramsProp);
  const [trainingModule, setTrainingModule] = useState<TrainingModuleWithSessions | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0-9 for sessions, 10 for quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  const campaign = trainingCampaigns.find(c => c.id === params.campaignId);
  const moduleTitle = formatIdToTitle(params.moduleId);

  useEffect(() => {
    if (params.moduleId) {
      generateTrainingModule({
        topic: moduleTitle,
        difficulty: 'easy',
        targetRole: 'Employee',
      }).then((module) => {
        const parsedQuiz = parseQuiz(module.quiz);
        const quizWithFallback = parsedQuiz.length > 0 ? parsedQuiz : [{question: 'Is security important?', options: ['Yes', 'No'], correctAnswer: 'Yes'}];
        
        setTrainingModule({ ...module, quiz: quizWithFallback });
        setSelectedAnswers(new Array(quizWithFallback.length).fill(''));
        setLoading(false);
      }).catch(err => {
        console.error("Failed to generate training module:", err);
        const fallbackModule: TrainingModuleWithSessions = {
            title: `Introduction to ${moduleTitle}`,
            sessions: Array.from({length: 10}, (_, i) => ({
                title: `Session ${i+1}: Placeholder`,
                content: `This is placeholder content for session ${i+1} of ${moduleTitle} as the AI generator is currently unavailable.`
            })),
            quiz: [{ question: 'Is learning about security important?', options: ['Yes', 'No'], correctAnswer: 'Yes' }]
        };
        setTrainingModule(fallbackModule);
        setSelectedAnswers(new Array(fallbackModule.quiz.length).fill(''));
        setLoading(false);
      });
    }
  }, [params.moduleId, moduleTitle]);

  const handleNext = () => {
    if (currentStep < 10) { // 10 sessions + 1 quiz start
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = value;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (trainingModule?.quiz?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finish quiz
      let correctAnswers = 0;
      trainingModule?.quiz.forEach((q, index) => {
        if (q.correctAnswer === selectedAnswers[index]) {
          correctAnswers++;
        }
      });
      setScore((correctAnswers / (trainingModule?.quiz.length || 1)) * 100);
      setQuizFinished(true);
    }
  };

  const isQuiz = currentStep === 10;
  const currentSession = trainingModule?.sessions[currentStep];
  const currentQuestion = trainingModule?.quiz[currentQuestionIndex];
  const progress = isQuiz ? ((currentQuestionIndex + 1) / (trainingModule?.quiz.length || 1)) * 100 : ((currentStep + 1) / 10) * 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="ml-4">Generating your training module...</p>
      </div>
    );
  }

  if (!trainingModule) {
    return <p>Could not generate training module. Please try again.</p>;
  }

  if (quizFinished) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>You have completed the quiz for "{trainingModule.title}".</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-5xl font-bold text-primary">{score.toFixed(0)}%</p>
            <p className="text-muted-foreground">Your score has been recorded.</p>
            <div>
              <h3 className="font-semibold text-lg font-headline mb-4">Review Your Answers</h3>
              <ul className="space-y-4 text-left">
                {trainingModule.quiz.map((q, index) => (
                  <li key={index} className="p-4 bg-background rounded-lg">
                    <p className="font-medium">{q.question}</p>
                    <div className="flex items-center mt-2">
                      {selectedAnswers[index] === q.correctAnswer ? (
                        <Check className="h-5 w-5 text-success mr-2" />
                      ) : (
                        <Wrong className="h-5 w-5 text-destructive mr-2" />
                      )}
                      <p className={`text-sm ${selectedAnswers[index] === q.correctAnswer ? 'text-success' : 'text-destructive'}`}>
                        Your answer: {selectedAnswers[index]}
                      </p>
                    </div>
                     <p className="text-sm text-muted-foreground ml-7">Correct answer: {q.correctAnswer}</p>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild>
              <Link href="/training">Back to Training Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{trainingModule.title}</CardTitle>
          <CardDescription>From the "{campaign?.title}" campaign.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold font-headline">
                          {isQuiz ? `Quiz` : `Session ${currentStep + 1} of 10`}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                         {isQuiz ? `Question ${currentQuestionIndex + 1} of ${trainingModule.quiz.length}` : `Step ${currentStep + 1} of 11`}
                        </span>
                    </div>
                    <Progress value={progress} className="w-full" />
                </div>

              {!isQuiz && currentSession && (
                <div className="space-y-4 min-h-[200px]">
                    <h3 className="text-lg font-semibold">{currentSession.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{currentSession.content}</p>
                </div>
              )}
              
              {isQuiz && currentQuestion && (
                <div className="space-y-4 min-h-[200px]">
                  <p className="font-semibold text-lg">{currentQuestion.question}</p>
                  <RadioGroup value={selectedAnswers[currentQuestionIndex]} onValueChange={handleAnswerChange}>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="font-normal">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                  <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  
                  {isQuiz ? (
                     <Button onClick={handleNextQuestion} disabled={!selectedAnswers[currentQuestionIndex]}>
                        {currentQuestionIndex < trainingModule.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      {currentStep < 9 ? 'Next Session' : 'Start Quiz'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
