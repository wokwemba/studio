

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import Header from "@/components/header";
import { ShieldCheck, Loader } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { useEffect } from "react";

const unauthenticatedRoutes = ["/login", "/signup"];
const protectedRoutes = ["/admin", "/profile"];

async function setSessionCookie(token: string) {
    await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
}

async function clearSessionCookie() {
    await fetch('/api/auth', {
        method: 'DELETE',
    });
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) {
      // Do nothing while we are waiting for the auth state
      return;
    }

    if (user) {
      // User is logged in
      user.getIdToken().then(setSessionCookie);
      if (unauthenticatedRoutes.includes(pathname)) {
        // If on login/signup page, redirect to dashboard
        router.push('/');
      }
    } else {
      // User is not logged in
      clearSessionCookie();
      const isProtectedRoute = protectedRoutes.some(p => pathname.startsWith(p));
      if (isProtectedRoute) {
        // If on a protected route, redirect to login
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router, pathname]);

  // Show a global loader while we are determining the auth state,
  // but not on the login/signup pages themselves.
  if (isUserLoading && !unauthenticatedRoutes.includes(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  // If the page is a public auth page (login/signup), or if the user is logged in,
  // render the layout. Otherwise, we show a loader while redirecting.
  if (unauthenticatedRoutes.includes(pathname) || user) {
     if (unauthenticatedRoutes.includes(pathname)) {
        return <>{children}</>;
      }

    return (
        <div className="min-h-screen w-full flex">
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">CyberAegis</h1>
            </Link>
            </SidebarHeader>
            <SidebarContent>
            <SidebarNav />
            </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        </div>
        </div>
    );
  }

  // If we are here, user is not logged in and not on an auth page,
  // the useEffect above is handling the redirect. Show a loader.
   return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
}
