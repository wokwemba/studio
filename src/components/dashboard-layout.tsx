"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import Header from "@/components/header";
import { ShieldCheck, Loader } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { useEffect } from "react";

const unauthenticatedRoutes = ["/login", "/signup"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && !unauthenticatedRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !unauthenticatedRoutes.includes(pathname)) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (unauthenticatedRoutes.includes(pathname)) {
    return <>{children}</>;
  }


  return (
    <div className="min-h-screen bg-background">
      <Sidebar variant="inset" collapsible="icon">
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
      <SidebarInset>
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </div>
  );
}
