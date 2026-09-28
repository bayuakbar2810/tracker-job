'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  Briefcase,
  Calendar,
  AlertCircle,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { calculateDaysSince } from '@/lib/utils';

export const Header: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const router = useRouter();
  const { applications, profile, searchQuery, setSearchQuery, setIsAddModalOpen } = useJobTrack();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueApps = applications.filter(
    (a) =>
      a.nextFollowUpDate &&
      a.nextFollowUpDate <= todayStr &&
      !['Rejected', 'Withdrawn', 'Hired'].includes(a.status)
  );

  const interviewApps = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Final Interview'
  );

  const totalNotifs = overdueApps.length + (interviewApps.length > 0 ? 1 : 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/applications?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900">JobTrack</span>
        </Link>
      </div>

      {/* Global Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden sm:flex items-center flex-1 max-w-md relative"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari perusahaan, posisi, platform, recruiter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs"
          >
            Clear
          </button>
        )}
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-colors"
            title="Pengingat & Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {totalNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-sm text-slate-900">Notifikasi & Pengingat</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {totalNotifs} aktif
                </span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {overdueApps.length === 0 && interviewApps.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Semua jadwal dan follow-up up to date! 🎉
                  </div>
                ) : (
                  <>
                    {overdueApps.map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 rounded-xl bg-rose-50/60 hover:bg-rose-50 border border-rose-100 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-rose-900 truncate">
                              Follow-up Diperlukan: {app.companyName}
                            </p>
                            <p className="text-[11px] text-rose-700">
                              {app.position} • {calculateDaysSince(app.appliedDate)} hari sejak apply
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}

                    {interviewApps.map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 rounded-xl bg-orange-50/60 hover:bg-orange-50 border border-orange-100 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <Calendar className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-orange-900 truncate">
                              Tahap Interview: {app.companyName}
                            </p>
                            <p className="text-[11px] text-orange-700">
                              Posisi: {app.position}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 text-center">
                <Link
                  href="/follow-ups"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                >
                  Buka Follow Up Hub <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Application</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Avatar Profile */}
        <Link
          href="/settings"
          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-blue-500/50 transition-all"
          title={profile.name}
        >
          {profile.name.slice(0, 2).toUpperCase()}
        </Link>
      </div>
    </header>
  );
};
