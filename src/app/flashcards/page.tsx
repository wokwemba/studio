'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateFlashcards,
  type GenerateFlashcardsOutput,
  type Flashcard,
} from '@/ai/flows/generate-flashcards-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const FlashcardComponent = ({ card, index }: { card: Flashcard, index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full h-64 [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-card border rounded-lg p-6 flex flex-col justify-center items-center">
          <p className="text-center text-lg font-semibold">{card.question}</p>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary text-primary-foreground border rounded-lg p-6 flex flex-col justify-center items-center">
          <p className="text-center text-base">{card.answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function FlashcardsPage() {
  const [topic, setTopic] = useState('Phishing');
  const [flashcards, setFlashcards] =
    useState<GenerateFlashcardsOutput['flashcards']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setFlashcards([]);
    setError(null);

    try {
      const result = await generateFlashcards({ topic });
      setFlashcards(result.flashcards);
    } catch (err) {
      console.error(err);
      setError('Failed to generate flashcards. The AI service may be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Copy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">AI Flashcards</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generate Flashcards</CardTitle>
          <CardDescription>
            Enter a cybersecurity topic to generate a set of interactive
            flashcards.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., SQL Injection, Social Engineering..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating...' : 'Generate'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="mt-6 text-center text-destructive">{error}</div>
      )}

      {flashcards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-headline mb-4 text-center">
            Your Flashcards on &quot;{topic}&quot;
          </h2>
          <p className="text-center text-muted-foreground mb-6">Click on a card to flip it over.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
                {flashcards.map((card, index) => (
                    <FlashcardComponent key={index} card={card} index={index} />
                ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
