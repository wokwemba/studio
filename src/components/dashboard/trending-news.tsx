'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Rss, ArrowRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { type GenerateCyberNewsOutput } from '@/ai/flows/generate-cyber-news-flow';

export function TrendingNews() {
    const [news, setNews] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { locale } = useLocale();

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/cyber-news?region=${locale}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch news data.');
                }
                const result: GenerateCyberNewsOutput = await response.json();
                setNews(result.headlines);
            } catch (err: any) {
                console.error("Failed to fetch cyber news:", err);
                setError("Could not load trending topics. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [locale]);

    return (
        <Card className="h-full">
            <CardHeader>
                 <CardTitle className="font-headline text-2xl flex items-center gap-3">
                     <Rss className="w-6 h-6 text-primary" />
                     <span>What's Trending</span>
                </CardTitle>
                 <CardDescription>Latest cybersecurity news and insights.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Fetching latest intelligence...</p>
                    </div>
                )}
                {error && <p className="text-center text-destructive">{error}</p>}
                {news && (
                     <ul className="space-y-4">
                        {news.map((item, index) => (
                            <li key={index} className="group flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <Rss className="w-4 h-4 text-primary/70 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-headline text-base font-semibold group-hover:text-primary transition-colors leading-tight">
                                        <a href={`https://www.google.com/search?q=${encodeURIComponent(item)}`} target="_blank" rel="noopener noreferrer">{item}</a>
                                    </h3>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
