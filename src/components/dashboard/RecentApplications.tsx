'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ExternalLink, Briefcase, ChevronRight } from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { getDurationBadge, getPlatformBadgeStyle } from '@/lib/utils';

export const RecentApplications: React.FC = () => {
  const { applications, updateApplicationStatus } = useJobTrack();

  // Sort by applied date descending, take top 6
  const recent = [...applications]
    .sort((a, b) => (b.appliedDate || '').localeCompare(a.appliedDate || ''))
    .slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Table Header / Title */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Recent Applications
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lamaran kerja terbaru yang Anda kirimkan
          </p>
        </div>
        <Link
          href="/applications"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
        >
          Semua Lamaran <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-5">Perusahaan & Posisi</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Tanggal Apply</th>
              <th className="py-3 px-4">Status (1-Click)</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recent.map((app) => {
              const duration = getDurationBadge(app.appliedDate, app.status);
              const platformStyle = getPlatformBadgeStyle(app.platform);

              return (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600 transition-colors block text-sm"
                    >
                      {app.companyName}
                    </Link>
                    <p className="text-xs text-slate-500">{app.position}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${platformStyle}`}
                    >
                      {app.platform}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <p className="text-slate-800 font-medium">{app.appliedDate}</p>
                    <p className="text-[11px] text-slate-400">{duration.text}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={app.status}
                      interactive={true}
                      onChange={(newStatus) => updateApplicationStatus(app.id, newStatus)}
                    />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="text-xs font-medium text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 group-hover:underline"
                    >
                      Detail
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
