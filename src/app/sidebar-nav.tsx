
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpenCheck,
  Trophy,
  FlaskConical,
  ScanLine,
  FileText,
  User,
  History,
  Wand2,
  BrainCircuit,
  Copy,
  BookUser,
  ClipboardList,
  ClipboardCheck,
  Key,
  ShieldAlert,
  Blocks,
  ShieldQuestion,
  GitBranch,
  Users,
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
import { useTranslation } from '@/hooks/useTranslation';
import { Loader } from 'lucide-react';
import { CyberGuardLogo } from '@/components/icons/cyber-guard-logo';

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const mainLinks = [
    { href: "/training", label: t('sidebar.my_training'), icon: BookOpenCheck },
    { href: "/leaderboard", label: t('sidebar.leaderboard'), icon: Trophy },
    { href: "/simulations", label: t('sidebar.request_simulation'), icon: FlaskConical },
    { href: "/phishing-engine/dashboard", label: t('sidebar.phishing_detector'), icon: ScanLine },
    { href: "/certificates", label: t('sidebar.my_certificates'), icon: FileText },
    { href: "/profile", label: t('sidebar.my_profile'), icon: User },
  ];

  const servicesLinks = [
      { href: "/custom-training", label: t('sidebar.custom_training'), icon: BookUser },
      { href: "/vapt", label: t('sidebar.vapt_console'), icon: ScanLine },
      { href: "/incident-response", label: t('sidebar.incident_response'), icon: ClipboardList },
      { href: "/system-audit", label: t('sidebar.system_audit'), icon: ClipboardCheck },
  ];

  const trainingLinks = [
      { href: "/training/module", label: t('sidebar.training_generator'), icon: Wand2 },
      { href: "/tutor", label: t('sidebar.ai_tutor'), icon: BrainCircuit },
      { href: "/flashcards", label: t('sidebar.flashcards'), icon: Copy },
      { href: "/training/history", label: t('sidebar.training_history'), icon: History },
      { href: "/training/achievements", label: t('sidebar.achievements'), icon: Trophy },
  ];

  const gamesLinks = [
      { href: "/escape-room", label: t('sidebar.escape_room'), icon: Key },
      { href: "/vulnerability-challenge", label: t('sidebar.vuln_challenge'), icon: ShieldAlert },
      { href: "/api-security-lab", label: t('sidebar.api_security_lab'), icon: Blocks },
      { href: "/threat-scenarios", label: t('sidebar.threat_scenarios'), icon: ShieldQuestion },
  ];

  const securityOpsLinks = [
      { href: "/incident-response-playbook", label: t('sidebar.ir_playbook_generator'), icon: ClipboardList },
  ];

  const threatIntelLinks = [
      { href: "/dark-web-monitor", label: t('sidebar.osint_dark_web'), icon: GitBranch },
      { href: "/threat-intelligence/actors", label: t('sidebar.threat_actor_profiles'), icon: Users },
  ];

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{roleId: string}>(userDocRef);

  const userRoleDocRef = useMemoFirebase(
    () => (firestore && userData?.roleId ? doc(firestore, "roles", userData.roleId) : null),
    [firestore, userData]
  );
  const { data: roleData, isLoading: isRoleDataLoading } = useDoc<{name: 'User' | 'Admin' | 'SuperAdmin'}>(userDocRef);

  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin' || user?.email === 'wokwemba@safaricom.co.ke';
  
  const isActive = (href: string) => {
    // Admin is a parent route, so it should be active for all sub-routes
    if (href === "/admin") {
      return pathname.startsWith("/admin");
    }
    // The "My Training" link should only be active for its main page and direct sub-pages, not other top-level links that also start with /training.
    if (href === "/training") {
        return pathname === '/training' || pathname.startsWith('/training/');
    }
    // For all other links, we want an exact match to avoid highlighting parent links incorrectly.
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const isLoading = isUserLoading || isUserDataLoading || isRoleDataLoading;

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
       <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.other_services')}</SidebarGroupLabel>
            {servicesLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
       <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.ai_learning_tools')}</SidebarGroupLabel>
            {trainingLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.games_challenges')}</SidebarGroupLabel>
            {gamesLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.security_operations')}</SidebarGroupLabel>
            {securityOpsLinks.map((link) => (
                 <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
        <SidebarSeparator />
        <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.threat_intelligence')}</SidebarGroupLabel>
            {threatIntelLinks.map((link) => (
                    <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(link.href)}
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
      {isLoading && state === 'expanded' && (
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
         <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isActive('/admin')}
                className="font-headline"
                tooltip="Admin Panel"
            >
                <Link href="/admin">
                    <CyberGuardLogo className="h-5 w-5" />
                    {state === 'expanded' && <span>{t('sidebar.admin_panel')}</span>}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
        </>
        )}
    </SidebarMenu>
  );
}
