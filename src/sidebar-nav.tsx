
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { SIDEBAR_LINKS, type SidebarLink } from "@/lib/sidebar-links";
import { LogIn, Loader } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, role, loading } = useAuthContext();
  
  const isActive = (href: string) => {
    if (href === "/admin") return pathname.startsWith("/admin");
    if (href === "/training") return pathname === '/training' || pathname.startsWith('/training/');
    return pathname === href;
  };
  
  if (loading) {
    return (
       <div className="p-4 flex items-center justify-center">
            <Loader className="w-6 h-6 animate-spin" />
       </div>
    );
  }

  if (user?.isAnonymous) {
    const anonLinks = SIDEBAR_LINKS.filter(link => link.roles.includes('Anonymous'));
    return (
      <SidebarMenu>
        {anonLinks.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive(link.href)}
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
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive('/login')}
            className="font-headline"
            tooltip="Login or Sign Up"
          >
            <Link href="/login">
              <LogIn className="h-5 w-5" />
              {state === 'expanded' && <span>Login / Sign Up</span>}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
  
  const filteredLinks = SIDEBAR_LINKS.filter(link => {
      if (!role) return false;
      return link.roles.includes(role) || (role === 'SuperAdmin' && link.roles.includes('Admin'));
  });

  return (
    <SidebarMenu>
      {filteredLinks.map((link: SidebarLink) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={isActive(link.href)}
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
