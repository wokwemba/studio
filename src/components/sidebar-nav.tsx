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
  Users,
  GitPullRequest,
  Mail,
  Zap,
  ShieldAlert,
  BarChart3,
  FileBadge,
  BadgeCheck,
  BookCopy,
  Blocks,
  Bell,
  Monitor,
  Building,
  Loader,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const mainLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "My Training", icon: BookUser },
  { href: "/flashcards", label: "Flashcards", icon: Copy },
  { href: "/simulations", label: "Simulations", icon: Target },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/risk-profile", label: "Risk Profile", icon: User },
  { href: "/certificates", label: "Certificates", icon: FileText },
  { href: "/threat-intel", label: "Threat Intel", icon: Globe },
  { href: "/recent-attacks", label: "Recent Attacks", icon: History },
];

const adminLinks = [
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & Roles", icon: Users },
    { href: "/admin/campaigns", label: "Training Campaigns", icon: GitPullRequest },
    { href: "/admin/content", label: "Courses & Content", icon: BookCopy },
    { href: "/admin/phishing", label: "Phishing Sims", icon: Mail },
    { href: "/admin/fraud", label: "Fraud Sims", icon: Zap },
    { href: "/admin/incidents", label: "Incident Mgmt", icon: ShieldAlert },
    { href: "/admin/analytics", label: "Risk & Analytics", icon: BarChart3 },
    { href: "/admin/compliance", label: "Compliance & Audit", icon: FileBadge },
    { href: "/admin/certifications", label: "Certifications", icon: BadgeCheck },
    { href: "/admin/policies", label: "Policies", icon: BookCopy },
    { href: "/admin/integrations", label: "Integrations", icon: Blocks },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/monitoring", label: "Logs & Monitoring", icon: Monitor },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
];

const superAdminLinks = [
    { href: "/admin/tenants", label: "Tenants", icon: Building },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{roleId: string}>(userDocRef);

  const userRoleDocRef = useMemoFirebase(
    () => (userData?.roleId ? doc(firestore, "roles", userData.roleId) : null),
    [userData]
  );
  const { data: roleData, isLoading: isRoleDataLoading } = useDoc<{name: 'User' | 'Admin' | 'SuperAdmin'}>(userRoleDocRef);

  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin';
  const userIsSuperAdmin = roleData?.name === 'SuperAdmin';


  const isActive = (href: string) => {
    if (href === "/admin" || href === "/admin/users") {
        return pathname.startsWith('/admin');
    }
    return pathname === href;
  }

  return (
    <SidebarMenu>
      {mainLinks.map((link) => (
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
      {(isUserDataLoading || isRoleDataLoading) && state === 'expanded' && (
        <>
        <SidebarSeparator />
          <div className="p-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading Admin Console...</span>
          </div>
        </>
      )}
      {userIsAdmin && (
      <>
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>Admin Console</SidebarGroupLabel>
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(link.href)}
                    className="font-headline"
                    tooltip={link.label}
                    size="sm"
                  >
                    <Link href={link.href}>
                      <link.icon className="h-4 w-4" />
                      {state === 'expanded' && <span>{link.label}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {userIsSuperAdmin && superAdminLinks.map((link) => (
                  <SidebarMenuItem key={link.href}>
                      <SidebarMenuButton
                          asChild
                          isActive={isActive(link.href)}
                          className="font-headline"
                          tooltip={link.label}
                          size="sm"
                      >
                          <Link href={link.href}>
                              <link.icon className="h-4 w-4" />
                              {state === 'expanded' && <span>{link.label}</span>}
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
          </SidebarGroup>
        </>
        )}
    </SidebarMenu>
  );
}
