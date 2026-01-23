'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Rss, ArrowRight } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { generateCyberNews, type GenerateCyberNewsOutput } from '@/ai/flows/generate-cyber-news-flow';

export function TrendingNews() {
    const [news, setNews] = useState<GenerateCyberNewsOutput['articles'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { locale } = useLocale();

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await generateCyberNews({ region: locale });
                setNews(result.articles);
            } catch (err: any) {
                console.error("Failed to fetch cyber news:", err);
                setError("Could not load trending topics. The AI service may be busy.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, [locale]);

    return (
        <div className="w-full max-w-7xl mx-auto py-16">
            <h2 className="text-3xl font-bold font-headline mb-12 text-center flex items-center justify-center gap-3">
                <Rss className="w-8 h-8 text-primary" />
                What's Trending in Cybersecurity
            </h2>
            <Card>
                <CardContent className="p-6">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Fetching latest intelligence...</p>
                        </div>
                    )}
                    {error && <p className="text-center text-destructive">{error}</p>}
                    {news && (
                        <ul className="space-y-6">
                            {news.map((item, index) => (
                                <li key={index} className="group grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
                                    <div>
                                        <p className="text-xs text-primary font-semibold tracking-wider uppercase">{item.source}</p>
                                        <h3 className="font-headline text-lg font-semibold group-hover:text-primary transition-colors">
                                            <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                                    </div>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="hidden md:block">
                                        <Button variant="ghost" size="icon">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
