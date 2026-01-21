import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '@/components/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CookieBanner } from '@/components/cookie-banner';

export const metadata: Metadata = {
  title: 'CCyberGuard',
  description: 'AI-Powered Cybersecurity Training Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7698959644327699"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn('font-body antialiased')} suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthProvider>
            <SidebarProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </SidebarProvider>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
