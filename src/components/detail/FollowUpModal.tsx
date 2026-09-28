'use client';

import React, { useState } from 'react';
import { X, Send, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { JobApplication } from '@/lib/types';

interface FollowUpModalProps {
  application: JobApplication;
  onClose: () => void;
}

const CHANNELS: Array<'LinkedIn' | 'WhatsApp' | 'Email' | 'Phone' | 'Other'> = [
  'LinkedIn',
  'WhatsApp',
  'Email',
  'Phone',
  'Other',
];

export const FollowUpModal: React.FC<FollowUpModalProps> = ({ application, onClose }) => {
  const { logFollowUp } = useJobTrack();
  const [channel, setChannel] = useState<'LinkedIn' | 'WhatsApp' | 'Email' | 'Phone' | 'Other'>('LinkedIn');
  const [followUpDate, setFollowUpDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(
    `Follow-up mengenai perkembangan proses rekrutmen untuk posisi ${application.position}.`
  );
  const [rescheduleDays, setRescheduleDays] = useState<number>(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let nextDate: string | undefined = undefined;
    if (rescheduleDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + rescheduleDays);
      nextDate = d.toISOString().slice(0, 10);
    }

    logFollowUp(application.id, channel, notes, nextDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Catat Follow Up Lamaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {application.companyName} • {application.position}
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
          {/* Channel selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Saluran Komunikasi / Channel
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CHANNELS.map((ch) => {
                const isSelected = channel === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Follow up date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tanggal Follow Up Dilakukan
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan / Isi Pesan Follow Up
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan hasil komunikasi dengan recruiter..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Next follow up schedule */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
              Jadwalkan Follow Up Berikutnya?
            </label>
            <select
              value={rescheduleDays}
              onChange={(e) => setRescheduleDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
            >
              <option value={7}>Ingatkan kembali dalam 7 hari</option>
              <option value={14}>Ingatkan kembali dalam 14 hari</option>
              <option value={3}>Ingatkan kembali dalam 3 hari</option>
              <option value={0}>Tidak perlu follow up lagi (Selesai)</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan Follow Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
