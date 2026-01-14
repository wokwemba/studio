
'use client';

import { useState, type FormEvent, useRef, useEffect } from 'react';
import { chatWithTutor, type ChatWithTutorInput } from '@/ai/flows/chat-flow';
import type { ChatMessage } from '@/ai/flows/schemas/tutor-schema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader, Send, BrainCircuit, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChatHistory } from './chat-history';

export default function TutorPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleTutorChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newHistory: ChatMessage[] = [...history, { role: 'user', content: query }];
    setHistory(newHistory);
    setQuery('');
    setIsLoading(true);
    setError(null);

    try {
      const input: ChatWithTutorInput = {
        history: newHistory,
        query: query,
      };
      const result = await chatWithTutor(input);
      setHistory(prev => [...prev, { role: 'model', content: result.response }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to get response from the tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '';
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading])

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
       <div className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>AI Cybersecurity Tutor</span>
        </h1>
        <p className="text-muted-foreground text-sm">
            Ask me anything about cybersecurity. I can help you understand concepts, prepare for exams, or clarify your doubts.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatHistory messages={history} userAvatar={userAvatar} />
         {isLoading && (
            <div className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback><BrainCircuit className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 mt-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    <p className="text-sm text-muted-foreground">Tutor is thinking...</p>
                </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t bg-background">
        <form onSubmit={handleTutorChat} className="flex items-center gap-2">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here... (e.g., 'What is a DDoS attack?')"
            className="flex-1 resize-none"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTutorChat(e);
                }
            }}
          />
          <Button type="submit" disabled={isLoading || !query.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
         {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
}
