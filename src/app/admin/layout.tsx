'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';

import { useUser } from '@/firebase/auth/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, ChevronDown, BarChart2 } from 'lucide-react';
import { Logo } from '@/components/icons';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
             <Logo className="h-8 w-8 text-primary" />
             <h1 className="text-xl font-bold text-primary tracking-tight hidden sm:block">
              AgriLog AI
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 pr-2 focus-visible:ring-0">
                    <Avatar className="h-8 w-8">
                       <AvatarImage
                        src={user.photoURL ?? `https://picsum.photos/seed/${user.uid}/32/32`}
                        alt={user.displayName ?? "User"}
                      />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                     <p className="text-sm font-medium hidden lg:block">{user.displayName ?? user.email}</p>
                     <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p>Signed in as</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Farmer View</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
