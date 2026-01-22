
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { useLocale } from '@/context/LocaleContext'; // Import useLocale to get current language
import { useTranslation } from '@/hooks/useTranslation';

const FlashcardComponent = ({ card, index }: { card: Flashcard, index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full h-64 [perspective:1000px] cursor-pointer"
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
  const { locale } = useLocale();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(locale);
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
      const result = await generateFlashcards({ topic, language });
      setFlashcards(result.flashcards);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate flashcards. The AI service may be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Copy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">{t('flashcards.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{t('flashcards.generate_title')}</CardTitle>
          <CardDescription>
            {t('flashcards.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">{t('flashcards.topic_label')}</Label>
              <Input
                id="topic"
                placeholder={t('flashcards.topic_placeholder')}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="language">{t('language')}</Label>
                <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                    <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="es">{t('spanish')}</SelectItem>
                        <SelectItem value="fr">{t('french')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic.trim()}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('flashcards.generating_button') : t('flashcards.generate_button')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <div className="mt-6 text-center text-destructive bg-destructive/10 p-4 rounded-md">{error}</div>
      )}

      {flashcards.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold font-headline mb-4 text-center">
            {t('flashcards.generated_title').replace('{topic}', `"${topic}"`)}
          </h2>
          <p className="text-center text-muted-foreground mb-6">{t('flashcards.instruction')}</p>
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
