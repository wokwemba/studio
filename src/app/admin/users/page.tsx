'use client';
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  roleId: string; // This will be 'Admin', 'User', 'SuperAdmin' from roles collection
  risk: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Invited' | 'Suspended';
  avatarId?: string;
};

// This is a simplified mapping. In a real app, you'd fetch roles and join.
const roleNameMapping: Record<string, 'Admin' | 'User' | 'SuperAdmin'> = {
    'admin_role_id': 'Admin',
    'user_role_id': 'User',
    'super_admin_role_id': 'SuperAdmin',
};


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

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersQuery);

  const getAvatar = (id?: string) => {
    if (!id) return '';
    return PlaceHolderImages.find((p) => p.id === id)?.imageUrl || '';
  }

  return (
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
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex justify-center items-center h-64'>
            <Loader className='w-8 h-8 animate-spin' />
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
              <TableRow key={user.id} className={cn(roleNameMapping[user.roleId] === 'SuperAdmin' && "bg-accent/50")}>
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
                <TableCell>{roleNameMapping[user.roleId] || 'User'}</TableCell>
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
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>View Activity</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className='text-destructive'>Deactivate User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
