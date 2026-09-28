'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BellRing,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { JobApplication, ActivityHistory } from '@/lib/types';
import { FollowUpModal } from '@/components/detail/FollowUpModal';
import { calculateDaysSince, formatDate } from '@/lib/utils';

export default function FollowUpsPage() {
  const { applications, activities } = useJobTrack();
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group applications by follow-up status
  const overdueApps: JobApplication[] = [];
  const todayApps: JobApplication[] = [];
  const upcomingApps: JobApplication[] = [];

  applications
    .filter((a) => !['Rejected', 'Withdrawn', 'Hired'].includes(a.status))
    .forEach((app) => {
      if (!app.nextFollowUpDate) return;
      if (app.nextFollowUpDate < todayStr) {
        overdueApps.push(app);
      } else if (app.nextFollowUpDate === todayStr) {
        todayApps.push(app);
      } else {
        upcomingApps.push(app);
      }
    });

  // Sort groups
  overdueApps.sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''));
  upcomingApps.sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''));

  // Completed follow-ups from activities
  const completedFollowUps = activities.filter((act) => act.activityType === 'Follow Up');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BellRing className="w-6 h-6 text-rose-600" />
          Follow-Up Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau jadwal follow up lamaran kerja agar tidak ada kesempatan yang terlewat.
        </p>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Overdue (Terlewat)</p>
            <p className="text-2xl font-extrabold text-rose-900 mt-0.5">{overdueApps.length}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-500/80" />
        </div>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Hari Ini (Today)</p>
            <p className="text-2xl font-extrabold text-amber-900 mt-0.5">{todayApps.length}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500/80" />
        </div>

        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Akan Datang (Upcoming)</p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{upcomingApps.length}</p>
          </div>
          <Calendar className="w-8 h-8 text-emerald-500/80" />
        </div>
      </div>

      {/* 1. OVERDUE SECTION (PRD §24) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Overdue — Perlu Follow-Up Segera ({overdueApps.length})
          </h2>
        </div>

        {overdueApps.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-xs text-slate-400 border border-slate-200">
            Tidak ada lamaran yang overdue. Semua jadwal terkendali dengan baik!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueApps.map((app) => {
              const daysSince = calculateDaysSince(app.appliedDate);
              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Jatuh tempo: {formatDate(app.nextFollowUpDate)}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-2">
                          {app.companyName}
                        </h3>
                        <p className="text-xs text-slate-600">{app.position}</p>
                      </div>
                      <span className="text-xs text-slate-400">{app.platform}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">
                      Sudah <strong>{daysSince} hari</strong> sejak lamaran dikirimkan.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Detail
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Follow Up Sekarang
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. TODAY SECTION (PRD §24) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Today — Jadwal Follow-Up Hari Ini ({todayApps.length})
          </h2>
        </div>

        {todayApps.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-xs text-slate-400 border border-slate-200">
            Tidak ada jadwal follow-up yang jatuh tempo tepat hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Jatuh tempo hari ini
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-slate-600">{app.position}</p>
                    </div>
                    <span className="text-xs text-slate-400">{app.platform}</span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    {calculateDaysSince(app.appliedDate)} hari sejak apply • Rule:{' '}
                    {app.followUpRuleDays || 7} hari
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Detail
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Lakukan Follow Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. UPCOMING SECTION (PRD §24) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Upcoming — Terjadwal Beberapa Hari Mendatang ({upcomingApps.length})
          </h2>
        </div>

        {upcomingApps.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-xs text-slate-400 border border-slate-200">
            Belum ada jadwal follow-up yang akan datang.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle divide-y divide-slate-100">
            {upcomingApps.map((app) => (
              <div
                key={app.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <Link
                    href={`/applications/${app.id}`}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600"
                  >
                    {app.companyName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {app.position} • {app.platform}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <p className="font-semibold text-emerald-700">
                      {formatDate(app.nextFollowUpDate)}
                    </p>
                    <p className="text-[11px] text-slate-400">Rencana Follow-Up</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold transition-colors"
                    title="Follow up lebih awal"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. COMPLETED FOLLOW-UPS LOG */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Riwayat Follow-Up yang Pernah Dilakukan ({completedFollowUps.length})
          </h2>
        </div>

        {completedFollowUps.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-xs text-slate-400 border border-slate-200 text-center">
            Belum ada riwayat log follow-up yang dicatat.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle divide-y divide-slate-100">
            {completedFollowUps.map((act) => {
              const targetApp = applications.find((a) => a.id === act.applicationId);
              return (
                <div key={act.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {targetApp ? targetApp.companyName : 'Lamaran'}
                      </span>
                      {act.channel && (
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          via {act.channel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{act.notes}</p>
                  </div>

                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(act.activityDate)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedApp && (
        <FollowUpModal application={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  );
}
