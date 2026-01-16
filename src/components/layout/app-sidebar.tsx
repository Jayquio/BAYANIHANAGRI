'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import {
  LayoutDashboard,
  BookText,
  LineChart,
  PieChart,
  Shield,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';

const farmerMenuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/records', icon: BookText, label: 'Farm Records' },
  {
    href: '/dashboard/yield-prediction',
    icon: LineChart,
    label: 'Yield Prediction',
  },
  { href: '/dashboard/analysis', icon: PieChart, label: 'Cost Analysis' },
];

const adminMenuItems = [
  { href: '/dashboard/admin', icon: Shield, label: 'Admin Dashboard' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { setOpenMobile } = useSidebar();

  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
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
          <h2 className="font-headline text-lg font-semibold tracking-tight">
            BayanihanAgri
          </h2>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={
                  pathname.startsWith(item.href) &&
                  (item.href !== '/dashboard' || pathname === '/dashboard')
                }
                tooltip={{ children: item.label }}
              >
                <Link href={item.href} onClick={handleLinkClick}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Settings' }}>
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{ children: 'Support' }}>
              <HelpCircle />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
