'use client';

import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function ProfilePage() {
  const { user } = useUser();
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar-1')?.imageUrl || '';

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userAvatar} data-ai-hint="person avatar" alt="User Avatar" />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user.displayName || 'No display name'}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">User ID</h3>
            <p className="text-muted-foreground text-sm">{user.uid}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
