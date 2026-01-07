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
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type User = {
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'SuperAdmin';
  risk: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Invited' | 'Suspended';
  avatarId: string;
};

const users: User[] = [
  { name: 'John Doe', email: 'john.doe@acme.com', role: 'Admin', risk: 'Low', status: 'Active', avatarId: 'leaderboard-user-1' },
  { name: 'Jane Smith', email: 'jane.smith@acme.com', role: 'User', risk: 'Medium', status: 'Active', avatarId: 'leaderboard-user-2' },
  { name: 'Peter Jones', email: 'peter.jones@acme.com', role: 'User', risk: 'High', status: 'Suspended', avatarId: 'leaderboard-user-3' },
  { name: 'Me (You)', email: 'admin@cyberaegis.com', role: 'SuperAdmin', risk: 'Low', status: 'Active', avatarId: 'user-avatar-1' },
  { name: 'Samantha Bee', email: 'samantha.bee@acme.com', role: 'User', risk: 'Low', status: 'Invited', avatarId: 'leaderboard-user-4' },
];

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
  const getAvatar = (id: string) => {
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
            {users.map((user) => (
              <TableRow key={user.email} className={cn(user.role === 'SuperAdmin' && "bg-accent/50")}>
                <TableCell>
                  <div className="flex items-center gap-3">
                     <Avatar className="h-9 w-9">
                      <AvatarImage src={getAvatar(user.avatarId)} data-ai-hint="person avatar" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-muted-foreground text-sm">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.role}</TableCell>
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
      </CardContent>
    </Card>
  );
}
