
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signUpWithEmail } from '@/firebase/auth';
import { ShieldCheck, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    if (!auth) {
        setError("Authentication service is not available. Please try again later.");
        setLoading(false);
        return;
    }

    const result = await signUpWithEmail(auth, email, password);

    setLoading(false);

    if (result.success) {
      toast({
        title: "Account Created!",
        description: "You have been successfully signed up.",
      });
      if (result.role === 'Admin' || result.role === 'SuperAdmin') {
        router.push('/admin');
      } else {
        router.push('/training');
      }
    } else {
      setError(result.error || 'An unexpected error occurred.');
    }
  };
  return (
     <div 
        className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background p-4"
    >
        <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1544256718-3b62ff04b2cb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            }}
            data-ai-hint="cyber security abstract"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

       <div className="relative z-10 flex items-center gap-2 mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-headline font-semibold text-white">CyberGuard</h1>
       </div>
        <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            </form>
        </CardContent>
        <CardFooter className='text-sm text-center flex justify-center'>
            <p>Already have an account? <Link href="/login" className='text-primary hover:underline'>Sign In</Link></p>
        </CardFooter>
        </Card>
    </div>
  );
}
