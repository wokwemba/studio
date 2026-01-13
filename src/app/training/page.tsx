'use client';

import { useState, useEffect, useCallback, type ElementType } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader,
  BrainCircuit,
  ShieldCheck,
  Zap,
  Bot,
  Search,
  CheckCircle,
  XCircle,
  RotateCw,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  generateAiToolsTraining,
} from '@/ai/flows/chat-flow';
import { type TrainingCard } from '@/ai/flows/schemas/chat-schema';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const iconMap: { [key: string]: ElementType } = {
  brain: BrainCircuit,
  shield: ShieldCheck,
  zap: Zap,
  bot: Bot,
  search: Search,
};

export default function TrainingInfographicPage() {
  const [cards, setCards] = useState<TrainingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { toast } = useToast();

  const fetchTraining = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCards([]);
    setUserAnswers({});
    setSubmittedAnswers({});
    setScore(0);
    try {
      const response = await generateAiToolsTraining();
      setCards(response.cards);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraining();
  }, [fetchTraining]);

  useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const handleAnswerChange = (cardIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [cardIndex]: answer }));
  };

  const handleSubmitAnswer = (cardIndex: number) => {
    const card = cards[cardIndex];
    const userAnswer = userAnswers[cardIndex];

    if (!userAnswer) {
      toast({
        variant: 'destructive',
        title: 'No Answer Selected',
        description: 'Please select an answer before submitting.',
      });
      return;
    }

    setSubmittedAnswers((prev) => ({ ...prev, [cardIndex]: true }));

    if (userAnswer === card.correctAnswer) {
      setScore((prev) => prev + 20);
      toast({
        title: 'Correct!',
        description: 'You earned 20 points.',
        className: 'border-green-500',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect',
        description: 'Nice try! Review the content and try to find the correct answer.',
      });
    }
  };

  const progress = (Object.keys(submittedAnswers).length / (cards.length || 1)) * 100;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-semibold font-headline">
          Generating Your AI Training Module...
        </h2>
        <p className="text-muted-foreground">
          The AI is preparing your interactive learning experience.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive font-headline">
            Failed to Generate Training
          </CardTitle>
          <CardDescription>
            There was an error while trying to create your training module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={fetchTraining}>
            <RotateCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            <span>AI in Cybersecurity</span>
            <div className="text-lg font-mono rounded-md bg-primary text-primary-foreground px-3 py-1">
              Score: {score}
            </div>
          </CardTitle>
          <CardDescription>
            An interactive overview of how AI is shaping the future of digital defense.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Progress value={progress} className="mb-4" />
           <p className="text-center text-sm text-muted-foreground mb-6">
             Card {currentSlide + 1} of {cards.length}
           </p>
          <Carousel setApi={setCarouselApi} className="w-full">
            <CarouselContent>
              {cards.map((card, index) => {
                const Icon = iconMap[card.icon] || BrainCircuit;
                const isSubmitted = submittedAnswers[index];

                return (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="bg-muted/30">
                        <CardHeader className="items-center text-center">
                          <Icon className="w-12 h-12 text-primary mb-2" />
                          <CardTitle className="font-headline">{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 text-center">
                          <p className="text-muted-foreground max-w-prose mx-auto">
                            {card.content}
                          </p>
                          <div className="w-full max-w-md mx-auto p-4 border rounded-lg bg-background text-left">
                            <p className="font-semibold mb-4">{card.question}</p>
                            <RadioGroup
                              value={userAnswers[index]}
                              onValueChange={(value) => handleAnswerChange(index, value)}
                              disabled={isSubmitted}
                              className="space-y-2"
                            >
                              {card.options.map((opt, i) => {
                                const isCorrect = opt === card.correctAnswer;
                                const isSelected = userAnswers[index] === opt;

                                return (
                                  <div key={i} className="flex items-center space-x-3">
                                    <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                                    <Label
                                      htmlFor={`q${index}-opt${i}`}
                                      className={`flex items-center gap-2 cursor-pointer ${
                                        isSubmitted && isCorrect ? 'text-green-500' : ''
                                      } ${
                                        isSubmitted && isSelected && !isCorrect ? 'text-red-500' : ''
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {isSubmitted && isCorrect && <CheckCircle className="h-4 w-4" />}
                                      {isSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4" />}
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                            {isSubmitted && (
                               <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full mt-4"
                                  onClick={() => carouselApi?.scrollNext()}
                                >
                                  Next Card
                                </Button>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="justify-center">
                          {!isSubmitted && (
                            <Button
                              onClick={() => handleSubmitAnswer(index)}
                              disabled={!userAnswers[index]}
                            >
                              Submit Answer
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>
    </div>
  );
}
