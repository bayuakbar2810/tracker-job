'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  MessageCircle,
  FileText,
  Trash2,
  Video,
  Send,
  CheckCircle,
  XCircle,
  Eye,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { ActivityHistory, ActivityType } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useJobTrack } from '@/context/JobTrackContext';

interface TimelineViewProps {
  activities: ActivityHistory[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ activities }) => {
  const { deleteActivity } = useJobTrack();

  // Sort activities newest first
  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(`${b.activityDate}T${b.activityTime || '00:00'}`).getTime() -
      new Date(`${a.activityDate}T${a.activityTime || '00:00'}`).getTime()
  );

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'Applied':
        return <Send className="w-3.5 h-3.5 text-blue-600" />;
      case 'Viewed':
        return <Eye className="w-3.5 h-3.5 text-purple-600" />;
      case 'Recruiter Contact':
      case 'Screening':
        return <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Interview':
      case 'User Interview':
        return <Video className="w-3.5 h-3.5 text-orange-600" />;
      case 'Technical Test':
      case 'Assessment':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case 'Offer':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'Follow Up':
        return <MessageCircle className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'Applied':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'Viewed':
        return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'Interview':
      case 'User Interview':
        return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'Offer':
        return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      case 'Rejected':
        return 'bg-rose-100 border-rose-200 text-rose-800';
      case 'Technical Test':
        return 'bg-amber-100 border-amber-200 text-amber-800';
      case 'Follow Up':
        return 'bg-sky-100 border-sky-200 text-sky-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-800';
    }
  };

  if (sortedActivities.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        Belum ada riwayat aktivitas yang dicatat.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sortedActivities.map((act) => {
        return (
          <div key={act.id} className="relative group">
            {/* Timeline Node Dot */}
            <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center shadow-xs transition-colors">
              <span className="w-2 h-2 rounded-full bg-slate-400 group-hover:bg-blue-600 transition-colors" />
            </div>

            {/* Activity Card */}
            <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getActivityColor(
                      act.activityType
                    )}`}
                  >
                    {getActivityIcon(act.activityType)}
                    {act.activityType}
                  </span>
                  {act.channel && (
                    <span className="text-xs text-slate-500 font-medium">
                      via {act.channel}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(act.activityDate)}
                    {act.activityTime && ` • ${act.activityTime}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Hapus riwayat aktivitas ini?')) {
                        deleteActivity(act.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-0.5"
                    title="Hapus Aktivitas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {act.notes && (
                <p className="text-xs text-slate-700 mt-2.5 leading-relaxed whitespace-pre-wrap">
                  {act.notes}
                </p>
              )}

              {act.attachmentName && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-blue-600">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{act.attachmentName}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
