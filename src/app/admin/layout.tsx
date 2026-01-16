// app/admin/layout.tsx
// This replaces your existing admin layout with a sidebar-free version

import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              🌾 AgriLog AI
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/admin" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </a>
            <a href="/admin/farmers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Farmers
            </a>
            <a href="/admin/records" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Farm Records
            </a>
            <a href="/admin/analytics" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Analytics
            </a>
            <a href="/admin/settings" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Settings
            </a>
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                A
              </div>
            </div>
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
