import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardLayout from '@/components/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { CookieBanner } from '@/components/cookie-banner';
import { LocaleProvider } from '@/context/LocaleContext';

export const metadata: Metadata = {
  title: 'CCyberGuard',
  description: 'AI-Powered Cybersecurity Training Platform',
  other: {
    'google-adsense-account': 'ca-pub-7698959644327699',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var e=localStorage.getItem("theme")||"dark";document.documentElement.classList.add(e)}catch(e){}})()`,
          }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7698959644327699"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')} suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthProvider>
            <LocaleProvider>
              <SidebarProvider>
                <DashboardLayout>{children}</DashboardLayout>
              </SidebarProvider>
            </LocaleProvider>
            <Toaster />
          </AuthProvider>
        </FirebaseClientProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
