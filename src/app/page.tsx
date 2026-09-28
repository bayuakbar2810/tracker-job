'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  Sparkles,
  Calendar,
  ArrowRight,
  Edit3,
  Check,
  X,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { KPICards } from '@/components/dashboard/KPICards';
import { ApplicationPipeline } from '@/components/dashboard/ApplicationPipeline';
import { FollowUpCard } from '@/components/dashboard/FollowUpCard';
import { RecentApplications } from '@/components/dashboard/RecentApplications';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    profile,
    updateProfile,
    setIsAddModalOpen,
    applications,
    clearAllData,
    resetAllData,
  } = useJobTrack();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const upcomingInterviews = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Final Interview'
  );

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfile({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleClearDemoData = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus semua data demo? Anda dapat memulai mencatat lamaran Anda sendiri dari kosong.'
      )
    ) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Dashboard Top Header & Profile Name Editor */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                Career Dashboard
              </span>
            </div>

            {/* Editable Name Greeting */}
            {isEditingName ? (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white border border-blue-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  title="Simpan Nama"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(profile.name);
                    setIsEditingName(false);
                  }}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  title="Batal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {getGreeting()},{' '}
                  <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => setIsEditingName(true)}>
                    {profile.name}
                  </span>{' '}
                  👋
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="opacity-70 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all"
                  title="Klik untuk ubah nama"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-sm text-slate-300 max-w-xl">
              Pantau perkembangan lamaran, jadwalkan follow-up tepat waktu, dan kelola dokumen karir Anda secara terstruktur.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {applications.length > 0 && (
              <button
                type="button"
                onClick={handleClearDemoData}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-400/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Hapus seluruh data untuk mulai dari kosong"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data Demo</span>
              </button>
            )}

            {applications.length === 0 && (
              <button
                type="button"
                onClick={() => resetAllData()}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Muat kembali data demo"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Data Demo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Application Pipeline */}
      <ApplicationPipeline />

      {/* Dual Column Layout: Recent Applications & Follow-Up Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          <RecentApplications />
        </div>

        {/* Right 1 Col: Follow-Up & Upcoming Activities */}
        <div className="space-y-6">
          <FollowUpCard />

          {/* Quick Upcoming Interviews Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                Jadwal Interview Aktif
              </h4>
              <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {upcomingInterviews.length} Wawancara
              </span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Belum ada interview terjadwal minggu ini.
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingInterviews.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block p-3 rounded-xl bg-orange-50/50 hover:bg-orange-50 border border-orange-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-orange-950">{app.companyName}</p>
                      <span className="text-[10px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{app.position}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {app.workType} • {app.workArrangement}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <Link
                href="/activities"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
              >
                Buka Kalender Aktivitas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
