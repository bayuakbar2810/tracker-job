'use client';

import React from 'react';
import Link from 'next/link';
import { useJobTrack } from '@/context/JobTrackContext';
import { Layers } from 'lucide-react';

export const ApplicationPipeline: React.FC = () => {
  const { applications } = useJobTrack();

  const total = applications.length || 1;

  const countApplied = applications.filter((a) => a.status === 'Applied').length;
  const countScreening = applications.filter((a) => a.status === 'Screening').length;
  const countInterview = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Final Interview'
  ).length;
  const countTest = applications.filter((a) => a.status === 'Technical Test').length;
  const countOffer = applications.filter(
    (a) => a.status === 'Offer' || a.status === 'Hired'
  ).length;

  const stages = [
    {
      name: 'Applied',
      count: countApplied,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      statusQuery: 'Applied',
    },
    {
      name: 'Screening',
      count: countScreening,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      statusQuery: 'Screening',
    },
    {
      name: 'Interview',
      count: countInterview,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      statusQuery: 'Interview',
    },
    {
      name: 'Test / Assessment',
      count: countTest,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      statusQuery: 'Technical Test',
    },
    {
      name: 'Offer / Hired',
      count: countOffer,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      statusQuery: 'Offer',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Application Pipeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribusi seluruh lamaran aktif Anda di setiap tahap rekrutmen
          </p>
        </div>
        <Link
          href="/applications"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Lihat Semua →
        </Link>
      </div>

      {/* Grid of Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
        {stages.map((stage) => {
          const percentage = Math.round((stage.count / total) * 100);
          return (
            <Link
              key={stage.name}
              href={`/applications?status=${encodeURIComponent(stage.statusQuery)}`}
              className={`p-3.5 rounded-xl border border-slate-200/80 transition-all hover:border-blue-400 hover:shadow-sm ${stage.bgColor} block group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 truncate">{stage.name}</span>
                <span className={`text-base font-extrabold ${stage.textColor}`}>
                  {stage.count}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${Math.max(percentage, stage.count > 0 ? 15 : 0)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{percentage}%</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 font-medium">
                  Detail →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
