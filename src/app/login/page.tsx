
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signInWithEmail, signInWithGoogle, resetInvitedUserPassword } from '@/firebase/auth';
import { ShieldCheck, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.655-3.544-11.141-8.234l-6.573 4.817C9.656 39.663 16.318 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.861 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);


function LoginForm() {
  const [email, setEmail] = useState('wokwemba1@gmail.com');
  const [password, setPassword] = useState('123456');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isInvitedUser, setIsInvitedUser] = useState(false);
  
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;

    setError(null);
    setLoading(true);

    if (!auth) {
        setError("Authentication service is not available. Please try again later.");
        setLoading(false);
        return;
    }

    if (isInvitedUser) {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        const result = await resetInvitedUserPassword(auth, email, password);
        setLoading(false);

        if (result.success) {
             toast({
                title: "Account Activated!",
                description: "Your password has been set and you are now logged in.",
             });
             router.push('/');
        } else {
            setError(result.error || 'An unexpected error occurred.');
        }

    } else {
        const result = await signInWithEmail(auth, email, password);
        setLoading(false);

        if (result.success) {
            toast({
                title: "Welcome Back!",
                description: "You have been successfully logged in.",
            });
            if (result.role === 'Admin' || result.role === 'SuperAdmin') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } else {
             if (result.isInvited) {
                toast({
                  title: 'Account Activation Required',
                  description: 'This is an invited account. Please set a password to continue.',
                });
                setIsInvitedUser(true);
                setError(null); // Clear previous error
            } else {
                setError(result.error || 'An unexpected error occurred.');
            }
        }
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || googleLoading) return;

    setError(null);
    setGoogleLoading(true);

    if (!auth) {
      setError("Authentication service is not available. Please try again later.");
      setGoogleLoading(false);
      return;
    }

    const result = await signInWithGoogle(auth);
    setGoogleLoading(false);

    if (result.success) {
      toast({
        title: "Welcome!",
        description: "You have been successfully logged in with Google.",
      });
      if (result.role === 'Admin' || result.role === 'SuperAdmin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'An unexpected error occurred during Google sign-in.');
    }
  }
  
  const title = isInvitedUser ? "Activate Your Account" : "Sign In";
  const description = isInvitedUser 
    ? "Welcome! Please set a password to activate your account." 
    : "Enter your credentials to access your account.";

    return (
         <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || googleLoading || isInvitedUser}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{isInvitedUser ? "New Password" : "Password"}</Label>
                <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || googleLoading}
                />
            </div>
            {isInvitedUser && (
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || googleLoading}
                    />
                </div>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? (isInvitedUser ? 'Activating...' : 'Signing In...') : (isInvitedUser ? 'Set Password & Sign In' : 'Sign In')}
            </Button>
            </form>
            {!isInvitedUser && (
                <>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card/80 px-2 text-muted-foreground backdrop-blur-lg">Or continue with</span>
                    </div>
                </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
                    {googleLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    {googleLoading ? 'Signing In...' : 'Sign in with Google'}
                </Button>
                </>
            )}
        </CardContent>
        <CardFooter className='text-sm text-center flex justify-center'>
            {!isInvitedUser && <p>Don't have an account? <Link href="/signup" className='text-primary hover:underline'>Sign Up</Link></p>}
        </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div 
        className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background p-4"
    >
        <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            }}
            data-ai-hint="cyber security abstract"
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

       <div className="relative z-10 flex items-center gap-2 mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-headline font-semibold text-white">Cyber-UP</h1>
       </div>
       {isClient ? <LoginForm /> : (
         <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-48">
                <Loader className="w-8 h-8 animate-spin" />
            </CardContent>
         </Card>
       )}
    </div>
  );
}

    
