
'use client';
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { type GenerateTrainingModuleOutput } from '@/ai/flows/generate-training-module';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, BookOpen, Lightbulb, CheckCircle, XCircle, Share2, Award } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CertificateTemplate } from '@/components/training/certificate';
import { format, addYears } from 'date-fns';

// Dynamically import the form component with SSR disabled
const GeneratorForm = dynamic(() => import('./generator-form').then(mod => mod.GeneratorForm), {
  ssr: false,
  loading: () => <div className="p-6"><Loader className="w-8 h-8 animate-spin" /></div>
});


export default function GenerateTrainingModulePage() {
  const [module, setModule] = useState<GenerateTrainingModuleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [topic, setTopic] = useState('Recognizing Phishing Emails');
  
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const handleModuleGenerated = (generatedModule: GenerateTrainingModuleOutput, selectedTopic: string) => {
    setModule(generatedModule);
    setTopic(selectedTopic); // Keep track of the topic for saving results
    setError(null);
    setIsLoading(false);
    // Reset quiz state
    setUserAnswers({});
    setQuizScore(null);
    setIsQuizSubmitted(false);
  };

  const handleGenerationStart = () => {
    setIsLoading(true);
    setModule(null);
    setError(null);
  };
  
  const handleGenerationError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }

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
        description: `You scored ${finalScore.toFixed(0)}%. ${finalScore >= 80 ? 'Congratulations, you passed!' : 'Keep practicing!'}`,
    });
  };
  
   const handleSaveResults = async () => {
    if (quizScore === null || !user || !firestore || !module) return;
    setIsSaving(true);
    try {
      const resultsCollection = collection(firestore, `users/${user.uid}/trainingResults`);
      
      addDocumentNonBlocking(resultsCollection, {
        moduleId: topic, // using topic as a pseudo-id
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

  const handleShare = () => {
    if (typeof window === 'undefined' || !module) return;
    const subject = `Check out this Cybersecurity Training Module: ${module.title}`;
    const body = `I generated a training module on CyberAegis about "${topic}". You can check it out here:\n\n${window.location.href}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleGenerateCertificate = async () => {
    if (!certificateRef.current || !module) return;
    setIsGeneratingCert(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`CyberAegis_Certificate_${topic.replace(/\s/g, '_')}.pdf`);
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been saved."
      });
    } catch(err) {
        console.error("Failed to generate certificate:", err);
        toast({
            variant: "destructive",
            title: "Certificate Generation Failed",
            description: "There was an error creating your certificate. Please try again."
        });
    } finally {
        setIsGeneratingCert(false);
    }
  };

  const isQuizComplete = module ? Object.keys(userAnswers).length === module.quiz.length : false;
  const passedQuiz = quizScore !== null && quizScore >= 80;


  return (
    <div className="space-y-6">
      <GeneratorForm 
        onGenerationStart={handleGenerationStart}
        onModuleGenerated={handleModuleGenerated}
        onGenerationError={handleGenerationError}
        isLoading={isLoading}
      />
      
      <div style={{ position: 'fixed', left: '-9999px', top: '0' }}>
         {module && user && (
            <CertificateTemplate
                ref={certificateRef}
                userName={user.displayName || user.email || 'Valued User'}
                courseName={module.title}
                completionDate={format(new Date(), 'MMMM d, yyyy')}
                expiryDate={format(addYears(new Date(), 1), 'MMMM d, yyyy')}
            />
         )}
      </div>

      {error && (
        <div className="mt-6 text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
      )}

      {isLoading && !module && (
        <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-48">
                <Loader className="w-8 h-8 animate-spin" />
                <p className="text-muted-foreground">Generating your training module...</p>
            </CardContent>
        </Card>
      )}

      {module && (
        <Card className="mt-6 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
            <CardDescription>
              A 10-session module with a 5-question quiz.
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
          <CardFooter className='flex-wrap gap-2'>
            <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Module
            </Button>
            <Button disabled={isQuizSubmitted}>Save Module to Library</Button>
            {isQuizSubmitted && (
                <Button onClick={handleSaveResults} disabled={isSaving}>
                    {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Save Results
                </Button>
            )}
             {passedQuiz && (
              <Button onClick={handleGenerateCertificate} disabled={isGeneratingCert}>
                {isGeneratingCert ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
                {isGeneratingCert ? 'Generating...' : 'Download Certificate'}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
