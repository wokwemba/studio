"use client";

import { Sidebar, SidebarContent, SidebarHeader, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import Header from "@/components/header";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-accent" />
            <h1 className="text-xl font-headline font-semibold text-sidebar-foreground">CyberAegis AI</h1>
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
