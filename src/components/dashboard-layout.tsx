
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
const publicRoutes = ["/"]; // Add other public routes here if needed

async function clearSessionCookie() {
    try {
        await fetch('/api/auth', {
            method: 'DELETE',
        });
    } catch (error) {
        console.error("Failed to clear session cookie:", error);
    }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the authentication state is fully determined.
    if (isUserLoading) {
      return; 
    }

    const isAuthRoute = unauthenticatedRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);

    if (user) {
      // User is logged in. If they are on an auth page, redirect them.
      if (isAuthRoute) {
        router.push('/');
      }
    } else {
      // User is not logged in.
      clearSessionCookie();
      // If the route is protected (not public and not an auth route), redirect to login.
      if (!isPublicRoute && !isAuthRoute) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router, pathname]);
  
  const isAuthPage = unauthenticatedRoutes.includes(pathname);
  
  // While loading, if the route is protected, show a loader.
  if (isUserLoading && !isAuthPage && !publicRoutes.includes(pathname)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  // If on an auth page and not logged in yet, show the page.
  if (isAuthPage && !user) {
    return <>{children}</>;
  }

  // If on a public page and not logged in, show the page.
  if (!user && publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }
  
  // If the user is logged in, show the main dashboard layout.
  if (user) {
    return (
        <div className="min-h-screen w-full flex">
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">CCyberGuard</h1>
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

  // Fallback for indeterminate states, renders nothing to prevent flashes.
  return null; 
}
