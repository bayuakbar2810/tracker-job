'use client';

import React from 'react';
import { Briefcase, Send, Users, Trophy, TrendingUp } from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';

export const KPICards: React.FC = () => {
  const { applications } = useJobTrack();

  const total = applications.length;

  const active = applications.filter(
    (a) => !['Rejected', 'Withdrawn', 'Hired'].includes(a.status)
  ).length;

  const interviews = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Final Interview'
  ).length;

  const offers = applications.filter(
    (a) => a.status === 'Offer' || a.status === 'Hired'
  ).length;

  // Calculate applications this month
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCount = applications.filter(
    (a) => a.appliedDate && a.appliedDate.startsWith(currentMonthStr)
  ).length;

  const cards = [
    {
      title: 'Total Applications',
      value: total,
      badge: `+${thisMonthCount} bulan ini`,
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: Send,
      iconColor: 'text-blue-600 bg-blue-50',
      description: 'Seluruh lowongan yang tercatat',
    },
    {
      title: 'Active Applications',
      value: active,
      badge: `${total > 0 ? Math.round((active / total) * 100) : 0}% dari total`,
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      icon: Briefcase,
      iconColor: 'text-purple-600 bg-purple-50',
      description: 'Sedang dalam proses rekrutmen',
    },
    {
      title: 'Interviews Scheduled',
      value: interviews,
      badge: 'Tahap wawancara',
      badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
      icon: Users,
      iconColor: 'text-orange-600 bg-orange-50',
      description: 'HR & User interview aktif',
    },
    {
      title: 'Offers Received',
      value: offers,
      badge: 'Goal tercapai!',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Trophy,
      iconColor: 'text-emerald-600 bg-emerald-50',
      description: 'Penawaran kerja resmi',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="text-slate-400 truncate ml-2 text-[11px]">{card.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
