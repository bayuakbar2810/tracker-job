'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Send,
  CheckCircle,
  FileText,
  PhoneCall,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { ActivityType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ActivitiesPage() {
  const { activities, applications } = useJobTrack();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation for calendar month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert to Monday = 0
  const startOffset = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group activities and scheduled follow-ups by date string YYYY-MM-DD
  const eventsByDate: Record<string, any[]> = {};

  activities.forEach((act) => {
    if (!eventsByDate[act.activityDate]) {
      eventsByDate[act.activityDate] = [];
    }
    const app = applications.find((a) => a.id === act.applicationId);
    eventsByDate[act.activityDate].push({
      type: 'activity',
      activityType: act.activityType,
      title: `${act.activityType} - ${app ? app.companyName : ''}`,
      time: act.activityTime,
      channel: act.channel,
      notes: act.notes,
      appId: act.applicationId,
    });
  });

  applications.forEach((app) => {
    if (app.nextFollowUpDate && !['Rejected', 'Withdrawn', 'Hired'].includes(app.status)) {
      if (!eventsByDate[app.nextFollowUpDate]) {
        eventsByDate[app.nextFollowUpDate] = [];
      }
      eventsByDate[app.nextFollowUpDate].push({
        type: 'followup',
        activityType: 'Follow Up',
        title: `Jadwal Follow Up: ${app.companyName}`,
        channel: app.platform,
        notes: `Posisi: ${app.position}`,
        appId: app.id,
      });
    }
  });

  const selectedDateEvents = eventsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Kalender & Jadwal Aktivitas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau seluruh agenda interview, jadwal follow up, dan aktivitas rekrutmen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          {/* Calendar Header with navigation */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50 opacity-40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isSelected = selectedDateStr === dateStr;
              const isToday =
                new Date().toISOString().slice(0, 10) === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-700 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event indicators */}
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => {
                      const isInterview = ev.activityType === 'Interview' || ev.activityType === 'User Interview';
                      const isFollowUp = ev.activityType === 'Follow Up';
                      return (
                        <div
                          key={idx}
                          className={`text-[9px] sm:text-[10px] truncate px-1 rounded font-medium ${
                            isInterview
                              ? 'bg-orange-100 text-orange-800'
                              : isFollowUp
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold pl-1">
                        +{dayEvents.length - 2} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Date Events & Agenda */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Agenda: {formatDate(selectedDateStr)}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {selectedDateEvents.length} agenda
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada agenda atau aktivitas tercatat pada tanggal ini.
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {selectedDateEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                      {ev.time && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {ev.time}
                        </span>
                      )}
                    </div>
                    {ev.channel && (
                      <p className="text-xs text-slate-500">Channel: {ev.channel}</p>
                    )}
                    {ev.notes && (
                      <p className="text-xs text-slate-600 leading-relaxed">{ev.notes}</p>
                    )}
                    {ev.appId && (
                      <div className="pt-1">
                        <Link
                          href={`/applications/${ev.appId}`}
                          className="text-xs font-semibold text-blue-600 hover:underline inline-block"
                        >
                          Lihat Detail Lamaran →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
