'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Video, FileText, CheckCircle2 } from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { ActivityType } from '@/lib/types';

interface AddActivityModalProps {
  applicationId: string;
  onClose: () => void;
}

const ACTIVITY_TYPES: ActivityType[] = [
  'Interview',
  'User Interview',
  'Screening',
  'Recruiter Contact',
  'Technical Test',
  'Assessment',
  'Follow Up',
  'Viewed',
  'Offer',
  'Rejected',
  'Other',
];

const CHANNELS = [
  'Google Meet',
  'Zoom',
  'WhatsApp',
  'Email',
  'Phone Call',
  'In-Person',
  'LinkedIn',
  'Portal',
  'Other',
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({ applicationId, onClose }) => {
  const { addActivity } = useJobTrack();
  const now = new Date();

  const [activityType, setActivityType] = useState<ActivityType>('Interview');
  const [activityDate, setActivityDate] = useState(now.toISOString().slice(0, 10));
  const [activityTime, setActivityTime] = useState(now.toTimeString().slice(0, 5));
  const [channel, setChannel] = useState<any>('Google Meet');
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      applicationId,
      activityType,
      activityDate,
      activityTime,
      channel,
      notes,
      attachmentName: attachmentName.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Catat Aktivitas Baru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catat interaksi terbaru dengan recruiter atau tahapan tes/interview
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipe Aktivitas (Activity Type) *
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal *
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Waktu / Jam
              </label>
              <input
                type="time"
                value={activityTime}
                onChange={(e) => setActivityTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Saluran / Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
            >
              {CHANNELS.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Aktivitas
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Interview HR membahas profil pengalaman kerja dan salary expectation..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lampiran / Attachment (Opsional)
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Contoh: Jadwal_Interview.pdf atau Case_Study_Pitch.pdf"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Aktivitas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
