'use client';
import { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  PlusCircle,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Loader } from 'lucide-react';
import { EditUserRoleDialog } from '@/components/admin/edit-user-role-dialog';
import { AddUserDialog } from '@/components/admin/add-user-dialog';

type User = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  risk: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Invited' | 'Suspended';
  avatarId?: string;
};

export type Role = {
    id: string;
    name: 'User' | 'Admin' | 'SuperAdmin';
}

const riskVariant: Record<User['risk'], 'success' | 'outline' | 'destructive'> = {
  'Low': 'success',
  'Medium': 'outline',
  'High': 'destructive',
};

const statusVariant: Record<User['status'], 'success' | 'secondary' | 'destructive'> = {
    'Active': 'success',
    'Invited': 'secondary',
    'Suspended': 'destructive',
};

const UserTableRow = ({ user }: { user: User }) => {
    const firestore = useFirestore();
    const roleDocRef = useMemoFirebase(() => (firestore && user.roleId ? doc(firestore, 'roles', user.roleId) : null), [firestore, user.roleId]);
    const { data: role } = useDoc<Role>(roleDocRef);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const getAvatar = (id?: string) => {
        if (!id) return '';
        const image = PlaceHolderImages.find((p) => p.id === id);
        return image?.imageUrl || PlaceHolderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '';
    }
    const roleName = role?.name || 'User';

    return (
        <>
        <TableRow className={cn(roleName === 'SuperAdmin' && "bg-accent/50")}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={getAvatar(user.avatarId)} data-ai-hint="person avatar" alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.name || 'N/A'}</div>
                        <div className="text-muted-foreground text-sm">{user.email}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>{roleName}</TableCell>
            <TableCell>
                <Badge variant={riskVariant[user.risk]}>{user.risk}</Badge>
            </TableCell>
            <TableCell>
                <Badge variant={statusVariant[user.status]}>{user.status}</Badge>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Activity</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-destructive'>Deactivate User</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
        <EditUserRoleDialog 
            user={user}
            currentRoleId={user.roleId}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
        />
        </>
    );
}


export default function AdminUsersPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const firestore = useFirestore();
  const { user: authUser } = useUser();
  
  const currentUserDocRef = useMemoFirebase(
    () => (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null, 
    [firestore, authUser]
  );
  const { data: currentUserData } = useDoc<{ tenantId: string, roleId: string }>(currentUserDocRef);
  const tenantId = currentUserData?.tenantId;

  const roleDocRef = useMemoFirebase(
    () => (firestore && currentUserData?.roleId) ? doc(firestore, 'roles', currentUserData.roleId) : null,
    [firestore, currentUserData]
  );
  const { data: roleData } = useDoc<Role>(roleDocRef);
  const userIsAdmin = roleData?.name === 'Admin' || roleData?.name === 'SuperAdmin';

  const usersQuery = useMemoFirebase(() => 
    (firestore && tenantId && userIsAdmin) ? query(collection(firestore, 'users'), where('tenantId', '==', tenantId)) : null, 
    [firestore, tenantId, userIsAdmin]
  );
  const { data: users, isLoading } = useCollection<User>(usersQuery, { skip: !userIsAdmin });

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Users &amp; Roles</CardTitle>
                <CardDescription>
                  Manage users, roles, and permissions.
                </CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
                <Button onClick={() => setIsAddUserOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {(isLoading && userIsAdmin) ? (
          <div className='flex justify-center items-center h-64'>
            <Loader className='w-8 h-8 animate-spin' />
          </div>
        ) : !userIsAdmin ? (
            <div className="text-center text-muted-foreground py-16">
                <p>You do not have permission to view this page.</p>
                <p className="text-sm">Please contact an administrator if you believe this is an error.</p>
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <UserTableRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
    {currentUserData?.tenantId && (
        <AddUserDialog 
            isOpen={isAddUserOpen}
            onOpenChange={setIsAddUserOpen}
            tenantId={currentUserData.tenantId}
        />
    )}
    </>
  );
}
