'use client';

import { useState, type FormEvent } from 'react';
import { detectFraud, type DetectFraudOutput } from '@/ai/flows/detect-fraud-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader, ScanLine, AlertTriangle, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type AnalysisType = 'Email' | 'SMS' | 'Link';

const verdictConfig = {
    Malicious: {
        icon: AlertTriangle,
        color: 'text-destructive',
        badgeVariant: 'destructive' as 'destructive',
        title: 'Malicious Content Detected',
    },
    Suspicious: {
        icon: ShieldQuestion,
        color: 'text-yellow-500',
        badgeVariant: 'outline' as 'outline',
        title: 'Suspicious Content Found',
    },
    Safe: {
        icon: ShieldCheck,
        color: 'text-success',
        badgeVariant: 'success' as 'success',
        title: 'Looks Safe',
    }
}

function AnalysisResult({ result }: { result: DetectFraudOutput }) {
    const config = verdictConfig[result.verdict];
    return (
        <Card className="mt-6 animate-in fade-in-50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <config.icon className={cn("h-8 w-8", config.color)} />
                    <div>
                        <CardTitle className={cn("font-headline", config.color)}>{config.title}</CardTitle>
                        <CardDescription>
                            <Badge variant={config.badgeVariant}>{result.verdict}</Badge>
                             <span className="ml-2">Confidence: {result.confidenceScore}%</span>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold text-sm mb-1">Explanation</h3>
                    <p className="text-muted-foreground text-sm">{result.explanation}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold text-sm mb-1">Recommendation</h3>
                    <p className="font-medium text-sm">{result.recommendation}</p>
                 </div>
            </CardContent>
             <CardFooter>
                <Progress value={result.confidenceScore} className="h-2" />
             </CardFooter>
        </Card>
    )
}

export default function FraudDetectorPage() {
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('Email');
  const [result, setResult] = useState<DetectFraudOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await detectFraud({ content, type: analysisType });
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze content. The AI service may be busy.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
      setAnalysisType(value as AnalysisType);
      setContent('');
      setResult(null);
      setError(null);
  }

  const placeholderText = {
      Email: "Paste the full body of the suspicious email here...",
      SMS: "Paste the suspicious text message here...",
      Link: "Paste the suspicious link/URL here...",
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ScanLine />
            <span>AI Fraud Detector</span>
          </CardTitle>
          <CardDescription>
            Analyze emails, SMS messages, and links for potential phishing or scam attempts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisType} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Email">Email</TabsTrigger>
              <TabsTrigger value="SMS">SMS</TabsTrigger>
              <TabsTrigger value="Link">Link</TabsTrigger>
            </TabsList>
            <form onSubmit={handleAnalyze} className="mt-4">
              <Textarea
                placeholder={placeholderText[analysisType]}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
                className="min-h-48"
              />
              <Button type="submit" disabled={isLoading || !content.trim()} className="mt-4">
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : `Analyze ${analysisType}`}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
      
      {error && (
        <div className="mt-6 text-destructive bg-destructive/10 p-4 rounded-md text-center">{error}</div>
      )}

      {result && <AnalysisResult result={result} />}
    </div>
  );
}
