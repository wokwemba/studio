import {
  BookOpenCheck,
  Trophy,
  FlaskConical,
  ScanLine,
  FileText,
  User,
  Wand2,
  BrainCircuit,
  Copy,
  History,
  ShieldCheck,
  LayoutDashboard,
  Users,
  Building,
  GitPullRequest,
  ClipboardList,
  BookCopy,
  ShieldAlert,
  BarChart3,
  Settings,
  LogIn,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Role = 'SuperAdmin' | 'Admin' | 'User' | 'Anonymous';

export type SidebarLink = {
  label: string;
  href: string;
  roles: Role[];
  icon: LucideIcon;
};

export const SIDEBAR_LINKS: SidebarLink[] = [
  // User Routes
  { href: "/training", label: "My Training", icon: BookOpenCheck, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/simulations", label: "Request Simulation", icon: FlaskConical, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/phishing-engine/dashboard", label: "Phishing Detector", icon: ScanLine, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/certificates", label: "My Certificates", icon: FileText, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/profile", label: "My Profile", icon: User, roles: ['User', 'Admin', 'SuperAdmin'] },

  // AI & Learning Tools
  { href: "/training/module", label: "Training Generator", icon: Wand2, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/tutor", label: "AI Tutor", icon: BrainCircuit, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/flashcards", label: "Flashcards", icon: Copy, roles: ['User', 'Admin', 'SuperAdmin', 'Anonymous'] },
  { href: "/training/history", label: "Training History", icon: History, roles: ['User', 'Admin', 'SuperAdmin'] },
  { href: "/training/achievements", label: "Achievements", icon: Trophy, roles: ['User', 'Admin', 'SuperAdmin'] },

  // Admin Routes
  { href: "/admin", label: "Admin Panel", icon: ShieldCheck, roles: ['Admin', 'SuperAdmin'] },
];
