import { Search, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc } from 'firebase/firestore';
import { useAuthContext } from "./auth/AuthProvider";
import { logout } from "@/lib/logout";
import { stopImpersonation } from "@/lib/impersonation";
import { useLocale } from '@/context/LocaleContext';
import { useTranslation } from '@/hooks/useTranslation';

export default function Header() {
  const { user, role, isImpersonating, realUser } = useAuthContext();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const { setLocale } = useLocale();
  const { t } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData } = useDoc<{ photoURL?: string; avatarId?: string }>(userDocRef);

  const handleLogoutOrStopImpersonation = async () => {
    if (!firestore) return;

    if (isImpersonating && realUser) {
      await stopImpersonation(firestore, { uid: realUser.uid, email: realUser.email, role });
    } else if (user && auth) {
      await logout({ auth, firestore, user, role, router });
    }
  };

  const userAvatar = userData?.photoURL 
    || PlaceHolderImages.find((p) => p.id === (userData?.avatarId || 'user-avatar-1'))?.imageUrl 
    || '';


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-headline font-semibold md:hidden">CyberGuard</h1>
      </div>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setLocale('en')}>{t('english')}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLocale('es')}>{t('spanish')}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setLocale('fr')}>{t('french')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={userAvatar} data-ai-hint="person avatar" alt="User Avatar" />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{isImpersonating ? `Impersonating: ${user?.displayName}` : t('header.my_account')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">{t('header.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/profile">{t('header.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutOrStopImpersonation}>
                {isImpersonating ? t('header.stop_impersonating') : t('header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
