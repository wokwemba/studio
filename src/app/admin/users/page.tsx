
'use client';

import { useState } from 'react';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader, Users, MoreVertical, PlusCircle, UserCog, Trash2, Send } from 'lucide-react';
import { AddUserDialog } from '@/components/admin/add-user-dialog';
import { EditUserRoleDialog } from '@/components/admin/edit-user-role-dialog';

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

function UserTableRow({ user, roles, onEditRole, onResendInvite, onDeleteUser }: { user: UserProfile, roles: Role[], onEditRole: (user: UserProfile) => void, onResendInvite: (user: UserProfile) => void, onDeleteUser: (user: UserProfile) => void }) {
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
            <DropdownMenuItem onSelect={() => onEditRole(user)}>
              <UserCog className="mr-2 h-4 w-4" /> Edit Role
            </DropdownMenuItem>
             {user.status === 'Invited' && (
                <DropdownMenuItem onSelect={() => onResendInvite(user)}>
                    <Send className="mr-2 h-4 w-4" /> Resend Invite
                </DropdownMenuItem>
            )}
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
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);

  const tenantId = (currentUser as any)?.tenantId;

  const usersQuery = useMemoFirebase(
    () => (firestore && tenantId) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null,
    [firestore, tenantId]
  );
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery, { skip: !usersQuery });

  const rolesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'roles') : null, [firestore]);
  const { data: roles, isLoading: rolesLoading } = useCollection<Role>(rolesQuery);
  
  const isLoading = usersLoading || rolesLoading;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users />
                    <span>Users & Roles</span>
                </CardTitle>
                <CardDescription>Manage users and their assigned roles in your organization.</CardDescription>
            </div>
            <Button onClick={() => setIsAddUserOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
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
                {users && roles && users.map(user => (
                  <UserTableRow 
                    key={user.id} 
                    user={user} 
                    roles={roles}
                    onEditRole={setUserToEdit}
                    onResendInvite={(u) => alert(`Resend invite for ${u.name}`)}
                    onDeleteUser={(u) => alert(`Delete user ${u.name}`)}
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
      
      {userToEdit && (
        <EditUserRoleDialog
          isOpen={!!userToEdit}
          onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
          user={{ id: userToEdit.id, name: userToEdit.name }}
          currentRoleId={userToEdit.roleId}
        />
      )}
    </>
  );
}
