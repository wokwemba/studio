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
import { Loader, Wand2 } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { topics } from '@/app/training/topics';
import { roles } from '@/app/training/roles';

interface GeneratorFormProps {
    onGenerationStart: () => void;
    onModuleGenerated: (module: GenerateTrainingModuleOutput, topic: string) => void;
    onGenerationError: (error: string) => void;
    isLoading: boolean;
}

export function GeneratorForm({ 
    onGenerationStart, 
    onModuleGenerated, 
    onGenerationError,
    isLoading
}: GeneratorFormProps) {
  const [formData, setFormData] = useState<GenerateTrainingModuleInput>({
    topic: 'Recognizing Phishing Emails',
    difficulty: 'easy',
    industry: 'Technology',
    targetRole: 'All Employees',
  });

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    onGenerationStart();

    try {
      const result = await generateTrainingModule(formData);
      onModuleGenerated(result, formData.topic);
    } catch (err: any) {
      console.error(err);
      onGenerationError(err.message || 'Failed to generate training module. The AI service may be busy. Please try again.');
    }
  };

  return (
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
            <Combobox
                items={topics.map(topic => ({ label: topic, value: topic }))}
                value={formData.topic}
                onChange={(value) => setFormData({ ...formData, topic: value })}
                placeholder="Select or search for a topic..."
                searchPlaceholder="Search topics..."
                notfoundText="No topics found."
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
                <Label htmlFor="industry">Industry</Label>
                <Input
                    id="industry"
                    placeholder="e.g., Finance, Healthcare..."
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    disabled={isLoading}
                />
            </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                 <Combobox
                    items={roles.map(role => ({ label: role, value: role }))}
                    value={formData.targetRole}
                    onChange={(value) => setFormData({ ...formData, targetRole: value })}
                    placeholder="Select or search for a role..."
                    searchPlaceholder="Search roles..."
                    notfoundText="No roles found."
                    disabled={isLoading}
                />
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
  );
}
