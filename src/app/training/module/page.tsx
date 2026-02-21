'use client';
import { useState, useRef, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { type GenerateTrainingModuleOutput } from '@/ai/flows/generate-training-module';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, BookOpen, Lightbulb, CheckCircle, XCircle, Share2, Award } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CertificateTemplate } from '@/components/training/certificate';
import { format, addYears } from 'date-fns';
import { useLocale } from '@/context/LocaleContext';

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
  const { locale } = useLocale();

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

  const handleSubmitQuiz = (e: FormEvent) => {
    e.preventDefault();
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
    
    const tenantId = (user as any).tenantId || 'default-tenant-ccyberguard';
    const progressDocRef = doc(firestore, `userProgress`, user.uid);

    const newProgressEntry = {
        moduleId: topic,
        score: quizScore,
        status: 'completed',
        completedAt: new Date().toISOString(),
    };

    try {
        await setDoc(progressDocRef, {
            userId: user.uid,
            tenantId: tenantId,
            completedModules: arrayUnion(newProgressEntry),
            updatedAt: new Date().toISOString(),
        }, { merge: true });

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
    const body = `I generated a training module on CCyberGuard about "${topic}". You can check it out here:\n\n${window.location.href}`;
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
      pdf.save(`CCyberGuard_Certificate_${topic.replace(/\s/g, '_')}.pdf`);
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
        locale={locale}
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
        <div className="mt-6 text-center text-destructive bg-destructive/10 p-4 rounded-md font-medium">{error}</div>
      )}

      {isLoading && !module && (
        <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-48">
                <Loader className="w-8 h-8 animate-spin text-primary" />
                <p className="text-foreground font-medium">Generating your training module...</p>
            </CardContent>
        </Card>
      )}

      {module && (
        <Card className="mt-6 animate-in fade-in-50 border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="font-headline text-3xl text-primary">{module.title}</CardTitle>
            <CardDescription className="text-foreground/80 text-base">
              Explore the 10 learning sessions below and complete the quiz to earn your certificate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div>
              <h3 className="font-headline text-xl mb-4 flex items-center gap-2 text-foreground font-bold border-b pb-2">
                <BookOpen className="text-primary" /> 
                Learning Sessions
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {module.sessions.map((session, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="border-b-accent/20">
                    <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors">
                      {`Session ${index + 1}: ${session.title}`}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground leading-relaxed text-lg px-2">
                      {session.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <form onSubmit={handleSubmitQuiz} className="space-y-6 pt-4 border-t border-primary/10">
              <h3 className="font-headline text-xl mb-4 flex items-center gap-2 text-foreground font-bold">
                <Lightbulb className="text-primary" /> 
                Knowledge Check Quiz
              </h3>
              
              {isQuizSubmitted && quizScore !== null && (
                <div className='mb-8 p-6 border-2 rounded-xl bg-primary/5 border-primary/20'>
                    <Label className='text-2xl font-headline font-bold text-foreground'>Your Final Score: {quizScore.toFixed(0)}%</Label>
                    <Progress value={quizScore} className="mt-4 h-3" />
                    <p className="mt-4 text-lg font-medium">
                      {passedQuiz ? "🎉 Congratulations! You've passed the assessment." : "Keep studying and try again to improve your score."}
                    </p>
                </div>
              )}
              
              <div className="space-y-8">
                {module.quiz.map((q, index) => (
                  <div key={index} className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-lg font-bold mb-4">{`${index + 1}. ${q.question}`}</p>
                    <RadioGroup
                      value={userAnswers[index]}
                      onValueChange={(value) => handleAnswerChange(index, value)}
                      disabled={isQuizSubmitted}
                      className="space-y-3"
                    >
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.correctAnswer;
                        const isSelected = userAnswers[index] === opt;
                        
                        return (
                        <div key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={opt} id={`q${index}-opt${i}`} className="w-5 h-5" />
                          <Label
                            htmlFor={`q${index}-opt${i}`}
                            className={`flex items-center gap-3 text-base cursor-pointer flex-1 ${
                              isQuizSubmitted && isCorrect ? 'text-success font-bold' : ''
                            } ${
                              isQuizSubmitted && isSelected && !isCorrect ? 'text-destructive font-bold' : ''
                            } ${!isQuizSubmitted ? 'text-foreground' : ''}`}
                          >
                           <span className="flex-1">{opt}</span>
                            {isQuizSubmitted && isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
                            {isQuizSubmitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                          </Label>
                        </div>
                      )})}
                    </RadioGroup>
                    {isQuizSubmitted && userAnswers[index] !== q.correctAnswer && (
                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <p className="text-sm font-bold text-primary uppercase tracking-wider">Correct Answer</p>
                          <p className="text-base text-foreground mt-1">{q.correctAnswer}</p>
                        </div>
                    )}
                  </div>
                ))}
              </div>
              
              {!isQuizSubmitted && (
                 <Button type="submit" disabled={!isQuizComplete} size="lg" className='mt-8 w-full sm:w-auto font-bold text-lg'>
                    Submit Assessment
                 </Button>
              )}
            </form>
          </CardContent>
          <CardFooter className='flex-wrap gap-4 border-t bg-muted/30 p-6 rounded-b-lg'>
            <Button variant="outline" onClick={handleShare} size="lg">
                <Share2 className="mr-2 h-5 w-5" />
                Share Module
            </Button>
            {isQuizSubmitted && (
                <Button onClick={handleSaveResults} disabled={isSaving} size="lg">
                    {isSaving && <Loader className="mr-2 h-5 w-5 animate-spin" />}
                    Save Progress
                </Button>
            )}
             {passedQuiz && (
              <Button onClick={handleGenerateCertificate} disabled={isGeneratingCert} size="lg" className="bg-success hover:bg-success/90 text-success-foreground font-bold">
                {isGeneratingCert ? <Loader className="mr-2 h-5 w-5 animate-spin" /> : <Award className="mr-2 h-5 w-5" />}
                {isGeneratingCert ? 'Generating...' : 'Download Certificate'}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
