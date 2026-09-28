'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  BellRing,
  CalendarDays,
  FolderGit2,
  BarChart3,
  Settings,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { applications, profile, setIsAddModalOpen } = useJobTrack();

  const activeAppsCount = applications.filter(
    (a) => !['Rejected', 'Withdrawn', 'Hired'].includes(a.status)
  ).length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueFollowUpsCount = applications.filter(
    (a) =>
      a.nextFollowUpDate &&
      a.nextFollowUpDate <= todayStr &&
      !['Rejected', 'Withdrawn', 'Hired'].includes(a.status)
  ).length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Applications',
      href: '/applications',
      icon: Briefcase,
      badge: activeAppsCount > 0 ? activeAppsCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Surat Lamaran AI',
      href: '/cover-letter-ai',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      name: 'Follow Ups',
      href: '/follow-ups',
      icon: BellRing,
      badge: overdueFollowUpsCount > 0 ? overdueFollowUpsCount : undefined,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      name: 'Activities',
      href: '/activities',
      icon: CalendarDays,
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FolderGit2,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-30 select-none border-r border-slate-800 hidden md:flex">
      {/* Brand Logo */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              JobTrack
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </span>
            <p className="text-xs text-slate-400">Career Management</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 text-sm transition-all duration-150 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Mini Footer */}
      <div className="p-3 m-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.name}</p>
            <p className="text-xs text-slate-400 truncate">{profile.targetRole.split('&')[0]}</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
};
