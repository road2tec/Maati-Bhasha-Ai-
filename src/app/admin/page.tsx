'use client';

import { useAuth, User } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoaderCircle, Users, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/header';
import Footer from '../components/footer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [areUsersLoading, setAreUsersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users.',
      });
    } finally {
      setAreUsersLoading(false);
    }
  };

  const handleBlockToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast({
        title: 'Success',
        description: `User has been ${!currentStatus ? 'blocked' : 'unblocked'}.`,
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update user status: ${error.message}`,
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!user || userId === user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `You cannot delete your own account.`,
      });
      return;
    }

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast({
        title: 'Success',
        description: 'User profile has been deleted.',
      });
      
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users /> Admin Panel - User Management
              </CardTitle>
              <CardDescription>
                View, block, and delete user accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {areUsersLoading ? (
                <div className="flex items-center justify-center p-8">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          {u.isBlocked ? (
                            <span className="text-destructive font-semibold">Blocked</span>
                          ) : (
                            <span className="text-green-600 font-semibold">Active</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.isAdmin ? (
                            <span className="font-semibold text-accent">Admin</span>
                          ) : (
                            <span className="text-muted-foreground">User</span>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant={u.isBlocked ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => handleBlockToggle(u.id, u.isBlocked)}
                          >
                            {u.isBlocked ? <ShieldCheck className="mr-2 h-4 w-4" /> : <ShieldBan className="mr-2 h-4 w-4" />}
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={user ? u.id === user.id : false}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user&apos;s
                                  profile from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(u.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}