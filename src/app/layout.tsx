'use client';

import React, { useState } from 'react';
import './globals.css';
import { JobTrackProvider } from '@/context/JobTrackContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { ApplicationModal } from '@/components/applications/ApplicationModal';
import { X, Briefcase, LayoutDashboard, BellRing, CalendarDays, FolderGit2, BarChart3, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Surat Lamaran AI', href: '/cover-letter-ai', icon: Sparkles },
    { name: 'Follow Ups', href: '/follow-ups', icon: BellRing },
    { name: 'Activities', href: '/activities', icon: CalendarDays },
    { name: 'Documents', href: '/documents', icon: FolderGit2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-slate-900 text-white h-full p-5 flex flex-col z-10 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-bold text-base">JobTrack PRO</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 pb-16 md:pb-8">
        <Header onMobileMenuToggle={() => setMobileDrawerOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenDrawer={() => setMobileDrawerOpen(true)} />

      {/* Global Add/Edit Modal */}
      <ApplicationModal />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <title>JobTrack — Personal Job Application Management System</title>
        <meta
          name="description"
          content="Kelola, pantau, dan analisis seluruh proses lamaran kerja secara profesional dan terstruktur."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <JobTrackProvider>
          <AppShell>{children}</AppShell>
        </JobTrackProvider>
      </body>
    </html>
  );
}
