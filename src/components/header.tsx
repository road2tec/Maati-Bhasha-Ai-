'use client';

import Link from 'next/link';
import { BotMessageSquare, Home, FileText, Info, Mail, Code, User, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-md">
            <BotMessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight font-headline text-foreground">
            MaatiBhasha AI
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link href="/"><Home className="mr-2"/>Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/translator"><BotMessageSquare className="mr-2"/>Translator</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#"><FileText className="mr-2"/>Documentation</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#"><Info className="mr-2"/>About</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#"><Mail className="mr-2"/>Contact</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#"><Code className="mr-2"/>Open Source</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
           {user?.isAdmin && (
              <Button variant="secondary" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/admin"><LayoutDashboard className="mr-2"/>Admin Panel</Link>
              </Button>
            )}
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User/>
                  <span>{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2" />
                  Login
                </Link>
              </Button>
               <Button asChild variant="secondary">
                <Link href="/register">
                  Register
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}