
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext } from '@/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Loader,
  User as UserIcon,
  Shield,
  BellRing,
  Palette,
  Archive,
  KeyRound,
  LogOut,
  Download,
  Trash2,
  Check,
  Globe,
} from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  displayName: z.string().min(3, 'Name must be at least 3 characters long.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Please enter your current password.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long.'),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
  });

const notificationsSchema = z.object({
  weeklySummary: z.boolean().default(false),
  trainingAlerts: z.boolean().default(true),
  productUpdates: z.boolean().default(false),
});

export default function ProfilePage() {
  const { user, loading: isUserLoading, role } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: user?.displayName || '' },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });
  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    // In a real app, these defaults would come from user.preferences in Firestore
    defaultValues: {
      weeklySummary: true,
      trainingAlerts: true,
      productUpdates: false,
    },
  });

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const userAvatar = useMemo(() => {
    if ((userData as any)?.photoURL) return (userData as any).photoURL;
    const avatarId = (userData as any)?.avatarId || 'user-avatar-1';
    return PlaceHolderImages.find((p) => p.id === avatarId)?.imageUrl || '';
  }, [userData]);

  useEffect(() => {
    profileForm.reset({ displayName: user?.displayName || '' });
  }, [user, profileForm]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(storedTheme);
  }, []);

  const handleThemeChange = (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };
  
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    // In a real app: await updateUserDisplayName(user, data.displayName);
    toast({ title: 'Profile Updated', description: 'Your display name has been changed.' });
  };
  
  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    // In a real app: await updateUserPassword(user, data.currentPassword, data.newPassword);
    toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
    passwordForm.reset();
  };

  const onNotificationsSubmit = (data: z.infer<typeof notificationsSchema>) => {
    // In a real app: await updateDocument(userDocRef, { preferences: { notifications: data } });
    toast({ title: 'Preferences Saved', description: 'Your notification settings have been updated.' });
  };

  const handleExportData = () => {
    // In a real app, this would trigger a server-side function to gather and email data.
    const data = JSON.stringify({ user, userData }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data Exported', description: 'Your data has been downloaded as a JSON file.' });
  };
  
  const handleDeleteAccount = () => {
    // In a real app: await deleteSelf();
    setIsDeleteAlertOpen(false);
    toast({ title: 'Account Deletion Initiated', description: 'Your account is scheduled for deletion.' });
  };


  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-6 font-headline">My Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn't find your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, and account preferences.</p>
      </header>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="notifications"><BellRing className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
          <TabsTrigger value="account"><Archive className="mr-2 h-4 w-4" />Account</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Public Profile</CardTitle><CardDescription>This information may be visible to others.</CardDescription></CardHeader>
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20"><AvatarImage src={userAvatar} alt={user.displayName || ''} /><AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback></Avatar>
                            <Button type="button" variant="outline">Change Picture</Button>
                        </div>
                         <FormField control={profileForm.control} name="displayName" render={({ field }) => (
                            <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                        <div><Label>Email Address</Label><Input value={user.email || 'No email provided'} readOnly disabled /></div>
                        <div><Label>Role</Label><Input value={role || 'User'} readOnly disabled /></div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 justify-end">
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                </form>
            </Form>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
           <Card>
            <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>For your security, we recommend using a strong, unique password.</CardDescription></CardHeader>
             <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                    <CardContent className="space-y-4">
                         <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                            <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                          <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                            <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                         )} />
                    </CardContent>
                    <CardFooter className="border-t pt-6 justify-end">
                        <Button type="submit">Update Password</Button>
                    </CardFooter>
                </form>
            </Form>
           </Card>
           <Card>
            <CardHeader><CardTitle>Linked Accounts</CardTitle><CardDescription>Accounts you can use to sign in.</CardDescription></CardHeader>
            <CardContent>
                {user.providerData.map(provider => (
                    <div key={provider.providerId} className="flex items-center justify-between p-3 rounded-md bg-muted">
                        <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <p className="font-semibold capitalize">{provider.providerId.split('.')[0]}</p>
                                <p className="text-xs text-muted-foreground">{provider.email}</p>
                            </div>
                        </div>
                        <Button variant="link" className="text-muted-foreground" disabled>Connected</Button>
                    </div>
                ))}
            </CardContent>
           </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
            <Card>
                <CardHeader><CardTitle>Email Notifications</CardTitle><CardDescription>Manage how we communicate with you.</CardDescription></CardHeader>
                <Form {...notificationsForm}>
                <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField control={notificationsForm.control} name="weeklySummary" render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Weekly Security Summary</FormLabel><p className="text-xs text-muted-foreground">Receive a summary of your security posture every week.</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                         )} />
                         <FormField control={notificationsForm.control} name="trainingAlerts" render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>New Training Assignments</FormLabel><p className="text-xs text-muted-foreground">Get notified when new training is assigned to you.</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                         )} />
                         <FormField control={notificationsForm.control} name="productUpdates" render={({ field }) => (
                           <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Product Updates & News</FormLabel><p className="text-xs text-muted-foreground">Receive updates about new features and platform news.</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                         )} />
                    </CardContent>
                    <CardFooter className="border-t pt-6 justify-end"><Button type="submit">Save Preferences</Button></CardFooter>
                </form>
            </Form>
            </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
            <Card>
                <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize the look and feel of the application.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><Label>Dark Mode</Label><p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p></div>
                        <Switch checked={theme === 'dark'} onCheckedChange={handleThemeChange} />
                    </div>
                     <div className="space-y-2 rounded-lg border p-4">
                        <Label>Language</Label>
                        <p className="text-xs text-muted-foreground pb-2">Choose your preferred language for the interface.</p>
                        <Select defaultValue="en-US">
                            <SelectTrigger><SelectValue placeholder="Select a language" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en-US">English (United States)</SelectItem>
                                <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                                <SelectItem value="es-ES">Español (España)</SelectItem>
                                <SelectItem value="fr-FR">Français (France)</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account">
             <Card>
                <CardHeader><CardTitle>Data & Privacy</CardTitle><CardDescription>Manage your personal data.</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Export Your Data</h3>
                            <p className="text-sm text-muted-foreground">Download a JSON file containing your profile and activity data.</p>
                        </div>
                        <Button variant="outline" onClick={handleExportData}><Download className="mr-2 h-4 w-4" />Export Data</Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-destructive mt-6">
                <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle><CardDescription>These actions are permanent and cannot be undone.</CardDescription></CardHeader>
                <CardContent>
                     <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Delete Your Account</h3>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                        </div>
                        <Button variant="destructive" onClick={() => setIsDeleteAlertOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
    
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                Delete My Account
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
