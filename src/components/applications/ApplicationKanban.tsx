'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Building2,
  Send,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { useJobTrack } from '@/context/JobTrackContext';
import { calculateDaysSince, getPlatformBadgeStyle, formatDate } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

interface ApplicationKanbanProps {
  applications: JobApplication[];
}

const KANBAN_COLUMNS: {
  title: string;
  status: ApplicationStatus;
  accent: string;
  headerBg: string;
}[] = [
  {
    title: 'Applied',
    status: 'Applied',
    accent: 'border-blue-500 text-blue-700',
    headerBg: 'bg-blue-50/80',
  },
  {
    title: 'Screening',
    status: 'Screening',
    accent: 'border-purple-500 text-purple-700',
    headerBg: 'bg-purple-50/80',
  },
  {
    title: 'Interview',
    status: 'Interview',
    accent: 'border-orange-500 text-orange-700',
    headerBg: 'bg-orange-50/80',
  },
  {
    title: 'Test / Assessment',
    status: 'Technical Test',
    accent: 'border-amber-500 text-amber-700',
    headerBg: 'bg-amber-50/80',
  },
  {
    title: 'Offer / Hired',
    status: 'Offer',
    accent: 'border-emerald-500 text-emerald-700',
    headerBg: 'bg-emerald-50/80',
  },
  {
    title: 'Rejected / Archived',
    status: 'Rejected',
    accent: 'border-slate-400 text-slate-700',
    headerBg: 'bg-slate-100/80',
  },
];

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({ applications }) => {
  const { updateApplicationStatus } = useJobTrack();

  const getAppsForColumn = (columnStatus: ApplicationStatus) => {
    if (columnStatus === 'Interview') {
      return applications.filter(
        (a) => a.status === 'Interview' || a.status === 'Final Interview'
      );
    }
    if (columnStatus === 'Offer') {
      return applications.filter((a) => a.status === 'Offer' || a.status === 'Hired');
    }
    if (columnStatus === 'Rejected') {
      return applications.filter((a) => a.status === 'Rejected' || a.status === 'Withdrawn');
    }
    return applications.filter((a) => a.status === columnStatus);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar items-start">
      {KANBAN_COLUMNS.map((col) => {
        const columnApps = getAppsForColumn(col.status);

        return (
          <div
            key={col.title}
            className="w-80 shrink-0 bg-slate-100/70 rounded-2xl border border-slate-200/80 flex flex-col max-h-[calc(100vh-220px)]"
          >
            {/* Column Header */}
            <div
              className={`p-3.5 rounded-t-2xl border-b border-slate-200 flex items-center justify-between ${col.headerBg}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.accent.split(' ')[0]}`} />
                <h4 className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                  {col.title}
                </h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-xs border border-slate-200">
                {columnApps.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1">
              {columnApps.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Belum ada lamaran
                </div>
              ) : (
                columnApps.map((app) => {
                  const daysSince = calculateDaysSince(app.appliedDate);
                  const platformStyle = getPlatformBadgeStyle(app.platform);

                  return (
                    <div
                      key={app.id}
                      className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                          {app.companyName}
                        </Link>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${platformStyle} shrink-0`}
                        >
                          {app.platform}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-1">
                        {app.position}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100">
                        <span>{app.workArrangement} • {app.location || '-'}</span>
                        <span className="font-medium text-slate-500">{daysSince} hari lalu</span>
                      </div>

                      {/* Quick stage transition buttons */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                        <StatusBadge
                          status={app.status}
                          interactive={true}
                          size="sm"
                          onChange={(newStatus) => updateApplicationStatus(app.id, newStatus)}
                        />
                        <Link
                          href={`/applications/${app.id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                        >
                          Detail <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
