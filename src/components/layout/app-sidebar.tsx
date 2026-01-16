'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useDoc } from '@/firebase';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { Home, PieChart, Calendar, Shield } from 'lucide-react';

const farmerMenuItems = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/records', icon: Calendar, label: 'Records' },
  { href: '/dashboard/analysis', icon: PieChart, label: 'Cost Analysis' },
];

const adminMenuItems = [
  { href: '/admin', icon: Shield, label: 'Admin Dashboard' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { setOpenMobile } = useSidebar();

  // Memoize the user doc reference so it remains stable between renders.
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<any>(userDocRef);

  const isAdmin = userProfile?.isAdmin === true;
  const menuItems = isAdmin ? adminMenuItems : farmerMenuItems;

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
          onClick={handleLinkClick}
        >
          <Logo className="h-8 w-8 text-primary" />
          <h2 className="font-headline text-lg font-semibold tracking-tight">AgriLog</h2>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => {
            const ActiveIcon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  active ? 'bg-muted text-primary' : 'text-muted-foreground'
                }`}
                onClick={handleLinkClick}
              >
                <ActiveIcon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* Optional footer content - keep stable */}
      </SidebarFooter>
    </Sidebar>
  );
}