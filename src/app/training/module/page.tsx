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
import { Loader, BookOpen, Wand2, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function GenerateTrainingModulePage() {
  const [formData, setFormData] = useState<GenerateTrainingModuleInput>({
    topic: 'Recognizing Phishing Emails',
    difficulty: 'easy',
    targetRole: 'All Employees',
  });
  const [module, setModule] = useState<GenerateTrainingModuleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setIsLoading(true);
    setModule(null);
    setError(null);

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
              <div className="space-y-4">
                {module.quiz.map((q, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/50">
                        <p className="font-semibold">{`${index + 1}. ${q.question}`}</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                            {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                        </ul>
                        <p className="text-sm mt-2 pt-2 border-t font-medium text-primary">Correct Answer: {q.correctAnswer}</p>
                    </div>
                ))}
              </div>
            </div>
          </CardContent>
           <CardFooter>
            <Button>Save Module to Library</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
