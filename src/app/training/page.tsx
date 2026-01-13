'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader, Send, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat, ChatResponse } from '@/ai/flows/chat-flow';
import { ChatMessage } from '@/ai/flows/schemas/chat-schema';

export default function TrainingChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [conversationId] = useState(
    () => `cyber-up-chat-${Date.now()}`
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Start the conversation with a welcome message from the bot
    const startConversation = async () => {
        setIsLoading(true);
        try {
            const initialResponse = await chat({
              conversationId,
              history: [],
              message: "Start the conversation",
            });
            setMessages(initialResponse.history);
            setScore(initialResponse.score);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            const errorMessage: ChatMessage = {
                role: 'model',
                content: 'Sorry, I am having trouble starting. Please refresh the page.',
            };
            setMessages([errorMessage]);
        }
        setIsLoading(false);
    };
    startConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await chat({
        conversationId,
        history: [...messages, userMessage],
        message: input,
      });

      setMessages(response.history);
      setScore(response.score);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content:
          'Sorry, I encountered an error. Please try sending your message again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-10rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="font-headline flex items-center justify-between">
            <span>AI Cybersecurity Tutor</span>
            <div className="text-lg font-mono rounded-md bg-primary text-primary-foreground px-3 py-1">
              Score: {score}
            </div>
          </CardTitle>
          <CardDescription>
            Chat with Gemini to learn about cybersecurity topics. Your knowledge will be scored live.
          </CardDescription>
        </CardHeader>
        <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-prose p-3 rounded-lg',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <UserIcon />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-4 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                 </Avatar>
                <div className="max-w-prose p-3 rounded-lg bg-muted flex items-center">
                    <Loader className="h-5 w-5 animate-spin"/>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Ask about phishing, malware, or anything cybersecurity..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
