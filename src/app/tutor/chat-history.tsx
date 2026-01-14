
'use client';

import type { ChatMessage } from '@/ai/flows/schemas/tutor-schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface ChatHistoryProps {
  messages: ChatMessage[];
  userAvatar: string;
}

export function ChatHistory({ messages, userAvatar }: ChatHistoryProps) {
  if (messages.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground h-full">
            <BrainCircuit className="h-16 w-16 mb-4" />
            <p className="text-lg">Welcome to the AI Tutor!</p>
            <p>Start by asking a question below.</p>
        </div>
    );
  }
  
  return (
    <div className="space-y-6">
        <AnimatePresence>
            {messages.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "flex items-start gap-4",
                        message.role === 'user' && "justify-end"
                    )}
                >
                {message.role === 'model' && (
                    <Avatar className="h-9 w-9 border-2 border-primary">
                    <AvatarFallback><BrainCircuit className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                )}
                
                <Card className={cn(
                    "max-w-xl", 
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                    <CardContent className="p-3 text-sm">
                    {message.content}
                    </CardContent>
                </Card>

                {message.role === 'user' && (
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={userAvatar} alt="User" />
                    <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                )}
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
  );
}
