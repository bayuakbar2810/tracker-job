'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BellRing,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { calculateDaysSince, getFollowUpStatus } from '@/lib/utils';
import { JobApplication } from '@/lib/types';
import { FollowUpModal } from '@/components/detail/FollowUpModal';

export const FollowUpCard: React.FC = () => {
  const { applications } = useJobTrack();
  const [selectedAppForFollowUp, setSelectedAppForFollowUp] = useState<JobApplication | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Find applications that require follow-up (either overdue or today, excluding rejected/withdrawn/hired)
  const pendingFollowUps = applications
    .filter(
      (a) =>
        a.nextFollowUpDate &&
        a.nextFollowUpDate <= todayStr &&
        !['Rejected', 'Withdrawn', 'Hired'].includes(a.status)
    )
    .sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''));

  if (pendingFollowUps.length === 0) {
    // Show positive empty state
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-600" />
              Follow Up Required
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Up to date
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tidak ada lamaran yang mendesak untuk di-follow up hari ini. Semua komunikasi terpantau rapi.
          </p>
        </div>

        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-slate-800">Semua Terjadwal Baik</p>
            <p className="text-slate-500">Anda dapat mengatur reminder follow up pada setiap lamaran.</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link
            href="/follow-ups"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Buka Follow Up Hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const primaryItem = pendingFollowUps[0];
  const daysSinceApplied = calculateDaysSince(primaryItem.appliedDate);
  const followUpInfo = getFollowUpStatus(primaryItem.nextFollowUpDate);

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-600" />
              Follow Up Required
            </h3>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
              {pendingFollowUps.length} Memerlukan Respon
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Lamaran berikut telah melewati jadwal follow-up yang ditentukan.
          </p>
        </div>

        {/* Featured Overdue Application Card */}
        <div className="mt-4 p-4 rounded-xl bg-rose-50/50 border border-rose-200/80">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{primaryItem.companyName}</h4>
              <p className="text-xs font-medium text-slate-600 mt-0.5">{primaryItem.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                  {primaryItem.platform}
                </span>
                <span className="text-[11px] text-slate-500">
                  Applied {daysSinceApplied} hari yang lalu
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-white border border-rose-300 px-2 py-1 rounded-lg">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Follow-up Disarankan
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center gap-2">
            <Link
              href={`/applications/${primaryItem.id}`}
              className="flex-1 text-center py-2 px-3 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Application
            </Link>
            <button
              type="button"
              onClick={() => setSelectedAppForFollowUp(primaryItem)}
              className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              Follow Up
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {pendingFollowUps.length > 1
              ? `+${pendingFollowUps.length - 1} lamaran lain perlu dicek`
              : 'Pantau secara berkala'}
          </span>
          <Link
            href="/follow-ups"
            className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Lihat Semua ({pendingFollowUps.length}) →
          </Link>
        </div>
      </div>

      {selectedAppForFollowUp && (
        <FollowUpModal
          application={selectedAppForFollowUp}
          onClose={() => setSelectedAppForFollowUp(null)}
        />
      )}
    </>
  );
};
