'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Plus, BellRing, Menu } from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';

export const MobileNav: React.FC<{ onOpenDrawer: () => void }> = ({ onOpenDrawer }) => {
  const pathname = usePathname();
  const { setIsAddModalOpen } = useJobTrack();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 flex items-center justify-around md:hidden shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] font-medium transition-colors ${
          pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/applications"
        className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] font-medium transition-colors ${
          pathname.startsWith('/applications') ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Briefcase className="w-5 h-5" />
        <span>Apps</span>
      </Link>

      {/* Floating Center Action Button */}
      <button
        type="button"
        onClick={() => setIsAddModalOpen(true)}
        className="w-12 h-12 -mt-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Link
        href="/follow-ups"
        className={`flex flex-col items-center gap-1 py-1 px-2 text-[11px] font-medium transition-colors ${
          pathname === '/follow-ups' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <BellRing className="w-5 h-5" />
        <span>Follow Up</span>
      </Link>

      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex flex-col items-center gap-1 py-1 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-900"
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>
    </nav>
  );
};
