
'use client';
import { useState, type FormEvent } from 'react';
import {
  generateTrainingModule,
  type GenerateTrainingModuleOutput,
  type GenerateTrainingModuleInput,
} from '@/ai/flows/generate-training-module';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader, BookOpen, Wand2, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function GenerateTrainingModulePage() {
  const [formData, setFormData] = useState<GenerateTrainingModuleInput>({
    topic: 'Recognizing Phishing Emails',
    difficulty: 'easy',
    targetRole: 'All Employees',
  });
  const [module, setModule] = useState<GenerateTrainingModuleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();


  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setIsLoading(true);
    setModule(null);
    setError(null);
    // Reset quiz state
    setUserAnswers({});
    setQuizScore(null);
    setIsQuizSubmitted(false);

    try {
      const result = await generateTrainingModule(formData);
      setModule(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate training module. The AI service may be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!module) return;
    let score = 0;
    module.quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    const finalScore = (score / module.quiz.length) * 100;
    setQuizScore(finalScore);
    setIsQuizSubmitted(true);
    toast({
        title: 'Quiz Submitted!',
        description: `You scored ${finalScore.toFixed(0)}%.`,
    });
  };
  
   const handleSaveResults = async () => {
    if (quizScore === null || !user || !firestore || !module) return;
    setIsSaving(true);
    try {
      const resultsCollection = collection(firestore, `users/${user.uid}/trainingResults`);
      
      addDocumentNonBlocking(resultsCollection, {
        moduleId: formData.topic, // using topic as a pseudo-id
        userId: user.uid,
        score: quizScore,
        timeTaken: 0, // Placeholder
        completedAt: new Date().toISOString(),
        riskImpact: 100 - quizScore, // Example calculation
      });

      toast({
        title: 'Results Saved',
        description: 'Your quiz results have been saved to your profile.',
      });
    } catch (error) {
        console.error("Error saving results: ", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save your results. Please try again.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const isQuizComplete = module ? Object.keys(userAnswers).length === module.quiz.length : false;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 />
            <span>AI Training Module Generator</span>
          </CardTitle>
          <CardDescription>
            Describe the training you need, and let AI create the content and quiz for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Module Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Secure Password Policies, GDPR Basics..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData({ ...formData, difficulty: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Finance Department, Developers..."
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !formData.topic.trim()}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating Module...' : 'Generate Module'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="mt-6 text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
      )}

      {module && (
        <Card className="mt-6 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
            <CardDescription>
              A 10-session module for {formData.targetRole} with a 5-question quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><BookOpen /> Learning Sessions</h3>
              <Accordion type="single" collapsible className="w-full">
                {module.sessions.map((session, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{`Session ${index + 1}: ${session.title}`}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {session.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            <div>
              <h3 className="font-headline text-lg mb-2 flex items-center gap-2"><Lightbulb /> Knowledge Check Quiz</h3>
              {isQuizSubmitted && quizScore !== null && (
                <div className='mb-6 p-4 border rounded-lg bg-muted/50'>
                    <Label className='text-lg font-headline'>Your Score: {quizScore.toFixed(0)}%</Label>
                    <Progress value={quizScore} className="mt-2" />
                </div>
              )}
              <div className="space-y-6">
                {module.quiz.map((q, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <p className="font-semibold">{`${index + 1}. ${q.question}`}</p>
                    <RadioGroup
                      value={userAnswers[index]}
                      onValueChange={(value) => handleAnswerChange(index, value)}
                      disabled={isQuizSubmitted}
                      className="mt-4 space-y-2"
                    >
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.correctAnswer;
                        const isSelected = userAnswers[index] === opt;
                        
                        return (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                          <Label
                            htmlFor={`q${index}-opt${i}`}
                            className={`flex items-center gap-2 ${
                              isQuizSubmitted && isCorrect ? 'text-success' : ''
                            } ${
                              isQuizSubmitted && isSelected && !isCorrect ? 'text-destructive' : ''
                            }`}
                          >
                           <span>{opt}</span>
                            {isQuizSubmitted && isCorrect && <CheckCircle className="h-4 w-4" />}
                            {isQuizSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4" />}
                          </Label>
                        </div>
                      )})}
                    </RadioGroup>
                    {isQuizSubmitted && userAnswers[index] !== q.correctAnswer && (
                        <p className="text-sm mt-3 pt-2 border-t text-primary/80">Correct Answer: {q.correctAnswer}</p>
                    )}
                  </div>
                ))}
              </div>
              {!isQuizSubmitted && (
                 <Button onClick={handleSubmitQuiz} disabled={!isQuizComplete} className='mt-6'>
                    Submit Quiz
                 </Button>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex gap-2'>
            <Button disabled={isQuizSubmitted}>Save Module to Library</Button>
            {isQuizSubmitted && (
                <Button onClick={handleSaveResults} disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Save Results
                </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
