

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import Header from "@/components/header";
import { ShieldCheck, Loader } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import type { Role } from "@/app/admin/users/page";

const unauthenticatedRoutes = ["/login"];
const protectedRoutes = ["/admin", "/profile"];

async function setSessionCookie(token: string, role: string) {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, role }),
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
  const firestore = useFirestore();

  useEffect(() => {
    if (isUserLoading || !firestore) {
      // Do nothing while we are waiting for the auth state or firestore
      return;
    }

    if (user) {
      // User is logged in
      const processUser = async () => {
          const token = await user.getIdToken();
          
          // Get user role from Firestore
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          let roleName = 'User'; // Default role
          if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.roleId) {
                  const roleDocRef = doc(firestore, 'roles', userData.roleId);
                  const roleDocSnap = await getDoc(roleDocRef);
                  if (roleDocSnap.exists()) {
                      roleName = (roleDocSnap.data() as Role).name || 'User';
                  }
              }
          }
          await setSessionCookie(token, roleName);
      }
      
      processUser();

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
  }, [user, isUserLoading, router, pathname, firestore]);

  // Show a global loader while we are determining the auth state,
  // but not on the login/signup pages themselves.
  if (isUserLoading && !unauthenticatedRoutes.includes(pathname)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is on a public auth page (login/signup), just render the content.
  if (unauthenticatedRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // If user is logged in, render the dashboard.
  if (user) {
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
  
  // For unauthenticated users on public pages (like the landing page)
  return <>{children}</>;
}
