
"use client";

import { usePathname } from "next/navigation";
import { Sidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/app/sidebar-nav";
import Header from "@/components/header";
import { ShieldCheck, Loader } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "./auth/AuthProvider";
import { ImpersonationBanner } from "./admin/impersonation-banner";

const unauthenticatedRoutes = ["/login", "/signup", "/partner-registration"];
const publicRoutes = ["/"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: isUserLoading } = useAuthContext();
  const pathname = usePathname();
  
  const isAuthPage = unauthenticatedRoutes.includes(pathname);
  const isPublicPage = publicRoutes.includes(pathname);
  
  const showLoader = isUserLoading && !isAuthPage && !isPublicPage;

  if (showLoader) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }
  
  if (isAuthPage || isPublicPage) {
    return <>{children}</>;
  }
  
  if (user) {
    return (
        <div className="min-h-screen w-full flex">
        <Sidebar>
            <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">CyberGuard</h1>
            </Link>
            </SidebarHeader>
            <SidebarContent>
            <SidebarNav />
            </SidebarContent>
        </Sidebar>
        <div className="flex flex-col flex-1">
            <ImpersonationBanner />
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
        </div>
        </div>
    );
  }

  // This case should not be reached due to ProtectedRoute component handling redirects.
  // It acts as a fallback to prevent rendering a broken state while auth is resolving.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
