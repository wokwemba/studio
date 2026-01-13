'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader } from 'lucide-react';
import { useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc<{name: string; email: string; photoURL?: string; avatarId?: string}>(userDocRef);
  
  const userAvatar = useMemo(() => {
    if (userData?.photoURL) {
        return userData.photoURL;
    }
    if (!userData?.avatarId) {
        const matchingImage = PlaceHolderImages.find((p) => p.id === 'user-avatar-1');
        return matchingImage?.imageUrl || '';
    }
    const matchingImage = PlaceHolderImages.find((p) => p.id === userData.avatarId);
    return matchingImage?.imageUrl || '';
  }, [userData]);


  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !userData) {
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 font-headline">My Profile</h1>
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">User Not Found</CardTitle>
                <CardDescription>We couldn't find your profile information. This can happen if your user profile document hasn't been created in the database yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Please try signing out and signing back in. If the problem persists, contact an administrator.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userAvatar} data-ai-hint="person avatar" alt="User Avatar" />
              <AvatarFallback>{userData.name?.charAt(0).toUpperCase() || userData.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{userData.name || 'No display name'}</p>
              <p className="text-muted-foreground">{userData.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">User ID</h3>
            <p className="font-mono text-xs bg-muted p-2 rounded-md">{user.uid}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
