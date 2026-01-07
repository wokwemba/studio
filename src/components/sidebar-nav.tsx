"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookUser,
  ShieldCheck,
  Trophy,
  LayoutDashboard,
  Target,
  FileText,
  User,
  Globe,
  History,
  Settings,
  Copy,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "My Training", icon: BookUser },
  { href: "/flashcards", label: "Flashcards", icon: Copy },
  { href: "/simulations", label: "Simulations", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/risk-profile", label: "Risk Profile", icon: User },
  { href: "/certificates", label: "Certificates", icon: FileText },
  { href: "/threat-intel", label: "Threat Intel", icon: Globe },
  { href: "/recent-attacks", label: "Recent Attacks", icon: History },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === link.href}
            className="font-headline"
            tooltip={link.label}
          >
            <Link href={link.href}>
              <link.icon className="h-5 w-5" />
              {state === 'expanded' && <span>{link.label}</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
