'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Percent,
  Layers,
  PieChart as PieIcon,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useJobTrack } from '@/context/JobTrackContext';

export default function AnalyticsPage() {
  const { applications } = useJobTrack();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const total = applications.length;

  // Responses = anything past 'Applied' stage
  const responsesCount = applications.filter(
    (a) => a.status !== 'Applied'
  ).length;

  const interviewsCount = applications.filter(
    (a) =>
      a.status === 'Interview' ||
      a.status === 'Final Interview' ||
      a.status === 'Offer' ||
      a.status === 'Hired'
  ).length;

  const offersCount = applications.filter(
    (a) => a.status === 'Offer' || a.status === 'Hired'
  ).length;

  const responseRate = total > 0 ? ((responsesCount / total) * 100).toFixed(1) : '0';
  const interviewRate = total > 0 ? ((interviewsCount / total) * 100).toFixed(1) : '0';
  const offerRate = total > 0 ? ((offersCount / total) * 100).toFixed(1) : '0';

  // 1. Applications by Platform data
  const platformCounts: Record<string, number> = {};
  applications.forEach((a) => {
    platformCounts[a.platform] = (platformCounts[a.platform] || 0) + 1;
  });
  const platformData = Object.keys(platformCounts).map((key) => ({
    name: key,
    count: platformCounts[key],
  }));

  // 2. Applications by Status data
  const statusCounts: Record<string, number> = {};
  applications.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });
  const STATUS_COLORS: Record<string, string> = {
    Applied: '#3b82f6',
    Screening: '#8b5cf6',
    Interview: '#f97316',
    'Technical Test': '#eab308',
    'Final Interview': '#fb923c',
    Offer: '#10b981',
    Hired: '#059669',
    Rejected: '#ef4444',
    Withdrawn: '#94a3b8',
    'On Hold': '#64748b',
  };
  const statusData = Object.keys(statusCounts).map((key) => ({
    name: key,
    value: statusCounts[key],
    color: STATUS_COLORS[key] || '#94a3b8',
  }));

  // 3. Applications Over Time (monthly trend)
  const monthlyCounts: Record<string, number> = {};
  applications.forEach((a) => {
    const month = a.appliedDate ? a.appliedDate.slice(0, 7) : '2026-09';
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });
  // Sort months
  const sortedMonths = Object.keys(monthlyCounts).sort();
  const timeData = sortedMonths.map((m) => {
    const dateObj = new Date(`${m}-01`);
    const label = dateObj.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    return {
      month: label,
      applications: monthlyCounts[m],
    };
  });

  // Funnel data (PRD §35)
  const funnelSteps = [
    { label: 'Applications', count: total, color: 'bg-blue-600', width: 'w-full' },
    {
      label: 'Responses (Dibalas)',
      count: responsesCount,
      color: 'bg-indigo-600',
      width: 'w-[82%]',
    },
    {
      label: 'Screening / Contact',
      count: applications.filter((a) => a.status !== 'Applied').length,
      color: 'bg-purple-600',
      width: 'w-[65%]',
    },
    {
      label: 'Interviews',
      count: interviewsCount,
      color: 'bg-orange-500',
      width: 'w-[48%]',
    },
    {
      label: 'Final Stage / Assessment',
      count: applications.filter(
        (a) =>
          a.status === 'Technical Test' ||
          a.status === 'Final Interview' ||
          a.status === 'Offer' ||
          a.status === 'Hired'
      ).length,
      color: 'bg-amber-500',
      width: 'w-[32%]',
    },
    {
      label: 'Offer / Hired',
      count: offersCount,
      color: 'bg-emerald-500',
      width: 'w-[20%]',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Job Application Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analisis objektif performa pencarian kerja, rasio konversi rekrutmen, dan funnel aplikasi.
        </p>
      </div>

      {/* KPI Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Applications
          </p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{total}</h3>
          <p className="text-xs text-slate-400 mt-2">Seluruh lamaran kerja terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Response Rate
          </p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{responseRate}%</h3>
          <p className="text-xs text-slate-400 mt-2">{responsesCount} lamaran mendapat respon</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Interview Rate
          </p>
          <h3 className="text-3xl font-extrabold text-orange-600 mt-1">{interviewRate}%</h3>
          <p className="text-xs text-slate-400 mt-2">{interviewsCount} lolos hingga tahap interview</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Offer Rate
          </p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{offerRate}%</h3>
          <p className="text-xs text-slate-400 mt-2">{offersCount} penawaran kerja resmi</p>
        </div>
      </div>

      {/* Recruitment Funnel Visual */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Recruitment Funnel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perjalanan tahapan seleksi dari pengiriman awal hingga penawaran kerja (Offer)
          </p>
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {funnelSteps.map((step, idx) => {
            const pct = total > 0 ? Math.round((step.count / total) * 100) : 0;
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{step.label}</span>
                  <span>
                    {step.count} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${step.color}`}
                    style={{ width: `${Math.max(pct, step.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Applications Over Time
          </h3>
          <p className="text-xs text-slate-500 mb-6">Tren pengiriman lamaran per bulan</p>
          <div className="h-64">
            {isClient && timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#appGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Memuat grafik...
              </div>
            )}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Applications by Platform
          </h3>
          <p className="text-xs text-slate-500 mb-6">Sumber saluran lowongan yang digunakan</p>
          <div className="h-64">
            {isClient && platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Memuat grafik...
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Komposisi status seluruh lamaran kerja yang sedang aktif maupun selesai
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64">
              {isClient && statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Memuat diagram...
                </div>
              )}
            </div>

            <div className="space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
