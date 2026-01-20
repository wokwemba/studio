'use client';

import { useState, useMemo } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase, updateUserStatus, deleteUser as deleteUserFromDb, useDoc } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
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
import { useAuthContext } from '@/components/auth/AuthProvider';
import { ALL_ROLES } from '@/lib/roles';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  department?: string;
  avatarId?: string;
  photoURL?: string;
  status: 'Active' | 'Invited' | 'Suspended';
  risk: 'Low' | 'Medium' | 'High';
  tenantId: string;
};

export type Role = {
    id: string;
    name: string;
    tier: number;
    description: string;
}

export type UserRoleMapping = {
    id: string; // This is the user's UID
    roles: string[]; // Array of Role IDs
}

const statusVariant: Record<UserProfile['status'], 'success' | 'secondary' | 'destructive'> = {
  Active: 'success',
  Invited: 'secondary',
  Suspended: 'destructive',
};

function UserTableRow({ user, onEditRole, onResendInvite, onSuspendUser, onReactivateUser, onDeleteUser, onViewDetails }: { 
    user: UserProfile & { roles: Role[] }, 
    onEditRole: (user: UserProfile & { roles: Role[] }) => void, 
    onResendInvite: (user: UserProfile) => void,
    onSuspendUser: (user: UserProfile) => void;
    onReactivateUser: (user: UserProfile) => void;
    onDeleteUser: (user: UserProfile) => void;
    onViewDetails: (user: UserProfile & { roles: Role[] }) => void;
}) {
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
      <TableCell>{user.department || 'N/A'}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
            {user.roles.length > 0 ? user.roles.map(r => <Badge key={r.id} variant="secondary" className="font-normal">{r.name}</Badge>) : <Badge variant="outline">No Role</Badge>}
        </div>
      </TableCell>
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
              <UserCog className="mr-2 h-4 w-4" /> Edit Roles
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
  const { user: currentUser, loading: isAuthLoading, roles: authRoles } = useAuthContext();
  const firestore = useFirestore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<(UserProfile & { roles: Role[] }) | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [userToView, setUserToView] = useState<(UserProfile & { roles: Role[] }) | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const isSuperAdmin = authRoles?.some(r => r.name === 'Domain Administrator' || r.name === 'Security Administrator');
  const tenantId = (currentUser as any)?.tenantId;

  // 1. Fetch users based on admin level
  const usersQuery = useMemoFirebase(
    () => {
        if (!firestore) return null;
        if (isSuperAdmin) {
            return collection(firestore, 'users');
        }
        if (tenantId) {
            return query(collection(firestore, 'users'), where('tenantId', '==', tenantId));
        }
        return null;
    },
    [firestore, tenantId, isSuperAdmin]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery, { skip: !usersQuery });

  // 2. Fetch roles for the users fetched above. Firestore 'in' query is limited to 30 items.
  const userIds = useMemo(() => users?.map(u => u.id).slice(0, 30) || [], [users]);
  
  const userRolesQuery = useMemoFirebase(
      () => {
          if (!firestore || userIds.length === 0) return null;
          // Use a where-in query to fetch roles only for the visible users
          return query(collection(firestore, 'user_roles'), where('__name__', 'in', userIds));
      },
      [firestore, userIds]
  );
  const { data: userRolesMappings, isLoading: userRolesLoading } = useCollection<UserRoleMapping>(userRolesQuery, { skip: userIds.length === 0 });

  const isLoading = isAuthLoading || usersLoading;

  const combinedUsers = useMemo(() => {
    if (!users) return [];

    const userRolesMap = new Map(userRolesMappings?.map(ur => [ur.id, ur.roles]) || []);

    return users.map(user => {
        const roleIds = userRolesMap.get(user.id) || [];
        const userRolesData = roleIds.map(roleId => ALL_ROLES.find(r => r.id === roleId)).filter(Boolean) as Role[];
        return {
            ...user,
            roles: userRolesData,
        };
    });
  }, [users, userRolesMappings]);


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
    if (!combinedUsers) return [];
    if (!searchTerm.trim()) return combinedUsers;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return combinedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowercasedTerm) ||
        user.email.toLowerCase().includes(lowercasedTerm) ||
        user.department?.toLowerCase().includes(lowercasedTerm) ||
        user.roles.some(r => r.name.toLowerCase().includes(lowercasedTerm))
    );
  }, [combinedUsers, searchTerm]);


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
                 <Button onClick={() => setIsAddUserOpen(true)} disabled={!tenantId && !isSuperAdmin}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <div className="relative mt-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search by name, email, department or role..." 
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
                  <TableHead>Department</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
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
      
      <EditUserRoleDialog
          isOpen={!!userToEdit}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
          user={userToEdit}
      />
      
      {userToView && (
          <UserDetailsDialog
            isOpen={!!userToView}
            onOpenChange={(isOpen) => !isOpen && setUserToView(null)}
            user={userToView}
            isSuperAdmin={isSuperAdmin}
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
