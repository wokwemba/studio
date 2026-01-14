
'use client';

import { useState, useMemo } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, updateUserStatus, deleteUser as deleteUserFromDb, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Loader, Users, MoreVertical, PlusCircle, UserCog, Trash2, Send, ShieldOff, ShieldCheck, Search, Eye } from 'lucide-react';
import { AddUserDialog } from '@/components/admin/add-user-dialog';
import { EditUserRoleDialog } from '@/components/admin/edit-user-role-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserDetailsDialog } from '@/components/admin/user-details-dialog';


export type Role = {
  id: string;
  name: 'User' | 'Admin' | 'SuperAdmin';
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatarId?: string;
  photoURL?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  risk: 'Low' | 'Medium' | 'High';
  tenantId: string;
};

const statusVariant: Record<UserProfile['status'], 'success' | 'secondary' | 'destructive'> = {
  Active: 'success',
  Invited: 'secondary',
  Suspended: 'destructive',
};

function UserTableRow({ user, roles, onEditRole, onResendInvite, onSuspendUser, onReactivateUser, onDeleteUser, onViewDetails }: { 
    user: UserProfile, 
    roles: Role[], 
    onEditRole: (user: UserProfile) => void, 
    onResendInvite: (user: UserProfile) => void,
    onSuspendUser: (user: UserProfile) => void;
    onReactivateUser: (user: UserProfile) => void;
    onDeleteUser: (user: UserProfile) => void;
    onViewDetails: (user: UserProfile) => void;
}) {
  const roleName = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
  const userAvatar = user.photoURL || PlaceHolderImages.find(p => p.id === user.avatarId)?.imageUrl || '';
  
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar} alt={user.name} data-ai-hint="person avatar" />
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
      </TableCell>
      <TableCell>{roleName}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onSelect={() => onViewDetails(user)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onEditRole(user)}>
              <UserCog className="mr-2 h-4 w-4" /> Edit Role
            </DropdownMenuItem>
             {user.status === 'Invited' && (
                <DropdownMenuItem onSelect={() => onResendInvite(user)}>
                    <Send className="mr-2 h-4 w-4" /> Resend Invite
                </DropdownMenuItem>
            )}
             {user.status === 'Active' && (
                <DropdownMenuItem onSelect={() => onSuspendUser(user)}>
                    <ShieldOff className="mr-2 h-4 w-4" /> Suspend User
                </DropdownMenuItem>
            )}
            {user.status === 'Suspended' && (
                <DropdownMenuItem onSelect={() => onReactivateUser(user)}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Reactivate User
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onDeleteUser(user)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToView, setUserToView] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const adminUserDocRef = useMemoFirebase(
    () => (currentUser ? doc(firestore, "users", currentUser.uid) : null),
    [currentUser, firestore]
  );
  const { data: adminUserData, isLoading: isAdminUserDataLoading } = useDoc<UserProfile>(adminUserDocRef);

  const tenantId = adminUserData?.tenantId;

  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery, { skip: !usersQuery });

  const rolesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'roles') : null, [firestore]);
  const { data: roles, isLoading: rolesLoading } = useCollection<Role>(rolesQuery);
  
  const isLoading = isAuthLoading || isAdminUserDataLoading || usersLoading || rolesLoading;

  const handleStatusUpdate = async (user: UserProfile, status: 'Active' | 'Suspended') => {
    if (!firestore) return;
    const result = await updateUserStatus(firestore, user.id, status);
    if (result.success) {
      toast({
        title: 'User Updated',
        description: `${user.name} has been ${status.toLowerCase()}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.error,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !firestore) return;
    const result = await deleteUserFromDb(firestore, userToDelete.id);

    if (result.success) {
      toast({
        title: 'User Deleted',
        description: `${userToDelete.name} has been permanently deleted.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: result.error,
      });
    }
    setUserToDelete(null);
  };
  
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchTerm.trim()) return users;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm)
    );
  }, [users, searchTerm]);


  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users />
                        <span>Manage Users</span>
                    </CardTitle>
                    <CardDescription>View, edit, and manage all users in your organization.</CardDescription>
                </div>
                 <Button onClick={() => setIsAddUserOpen(true)} disabled={!tenantId}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by name or email..." 
                    className="pl-8 w-full sm:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-8 h-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles && filteredUsers.map(user => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
                    roles={roles}
                    onViewDetails={setUserToView}
                    onEditRole={setUserToEdit}
                    onResendInvite={(u) => alert(`Resend invite for ${u.name}`)}
                    onSuspendUser={(u) => handleStatusUpdate(u, 'Suspended')}
                    onReactivateUser={(u) => handleStatusUpdate(u, 'Active')}
                    onDeleteUser={setUserToDelete}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {tenantId && (
        <AddUserDialog 
          isOpen={isAddUserOpen} 
          onOpenChange={setIsAddUserOpen} 
          tenantId={tenantId}
        />
      )}
      
      {userToEdit && roles && (
        <EditUserRoleDialog
          isOpen={!!userToEdit}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
          user={{ id: userToEdit.id, name: userToEdit.name }}
          currentRoleId={userToEdit.roleId}
          roles={roles}
        />
      )}

      {userToView && roles && (
          <UserDetailsDialog
            isOpen={!!userToView}
            onOpenChange={(isOpen) => !isOpen && setUserToView(null)}
            user={userToView}
            roleName={roles.find(r => r.id === userToView.roleId)?.name || 'Unknown'}
          />
      )}

      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user
                    account for <span className='font-bold'>{userToDelete.name}</span> and remove their data from our servers.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
