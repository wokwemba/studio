'use client';

import { useState, useRef, FormEvent, useEffect } from 'react';
import {
  chatWithTutor,
  type ChatWithTutorInput,
  type TutorResponse,
} from '@/ai/flows/chat-flow';
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
import { Loader, User, Bot, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export default function MyTrainingPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const chatInput: ChatWithTutorInput = {
        history: messages,
        query: input,
      };
      const result: TutorResponse = await chatWithTutor(chatInput);
      const modelMessage: ChatMessage = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setError('I\'m sorry, I\'m having trouble responding right now. The AI service may be temporarily overloaded. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

   useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
       <div className='mb-6'>
         <h1 className="text-3xl font-bold font-headline">AI Cybersecurity Tutor</h1>
         <p className="text-muted-foreground">
            Chat with our AI tutor to learn about any cybersecurity topic.
         </p>
       </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
           <CardTitle className='font-headline flex items-center gap-2'><Wand2 /> AI Chat</CardTitle>
           <CardDescription>Your knowledge will not be scored in this chat.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                    {message.role === 'model' && (
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Bot className="w-6 h-6" />
                        </div>
                    )}
                    <div
                        className={cn(
                        'max-w-lg rounded-lg p-3 text-sm',
                        message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        {message.content}
                    </div>
                     {message.role === 'user' && (
                        <div className="p-2 rounded-full bg-muted">
                            <User className="w-6 h-6" />
                        </div>
                    )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3">
                   <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Bot className="w-6 h-6" />
                    </div>
                  <div className="bg-muted rounded-lg p-3 flex items-center">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              {error && (
                 <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div className="max-w-lg rounded-lg p-3 text-sm bg-destructive/20 text-destructive">
                       {error}
                    </div>
                </div>
              )}
              {messages.length === 0 && !isLoading && (
                 <div className="text-center text-muted-foreground text-sm">
                    Start the conversation by asking a question below. For example: "What is phishing?"
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-6">
          <form onSubmit={handleChatSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Ask about a cybersecurity topic..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Send'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
