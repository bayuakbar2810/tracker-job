'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Send,
  FileText,
  MapPin,
  Tag,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { StatusBadge } from '@/components/applications/StatusBadge';
import { TimelineView } from '@/components/detail/TimelineView';
import { AddActivityModal } from '@/components/detail/AddActivityModal';
import { FollowUpModal } from '@/components/detail/FollowUpModal';
import { ContactCard } from '@/components/detail/ContactCard';
import {
  formatDate,
  formatDateTime,
  calculateDaysSince,
  getDurationBadge,
  getPlatformBadgeStyle,
} from '@/lib/utils';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    applications,
    activities,
    updateApplicationStatus,
    deleteApplication,
    setEditingApplication,
  } = useJobTrack();

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  const application = applications.find((a) => a.id === id);
  const appActivities = activities.filter((act) => act.applicationId === id);

  if (!application) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-subtle max-w-lg mx-auto mt-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Lamaran Tidak Ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Data lamaran pekerjaan dengan ID tersebut mungkin sudah dihapus atau tidak tersedia.
        </p>
        <Link
          href="/applications"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
        >
          Kembali ke Daftar Lamaran
        </Link>
      </div>
    );
  }

  const duration = getDurationBadge(application.appliedDate, application.status);
  const platformStyle = getPlatformBadgeStyle(application.platform);

  const cvDoc = application.documents.find((d) => d.documentType === 'CV');
  const portfolioDoc = application.documents.find((d) => d.documentType === 'Portfolio');
  const coverLetterDoc = application.documents.find((d) => d.documentType === 'Cover Letter');

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Applications</span>
        </Link>
      </div>

      {/* Main Top Header (PRD §17) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${platformStyle}`}
            >
              {application.platform}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Dilamar pada {formatDate(application.appliedDate)}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {duration.text}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {application.position}
          </h1>

          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <Building2 className="w-4 h-4 text-slate-400" />
              {application.companyName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {application.location || 'Indonesia'}
            </span>
            <span>•</span>
            <span>{application.workArrangement}</span>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge
            status={application.status}
            interactive={true}
            size="lg"
            onChange={(newStatus) => updateApplicationStatus(application.id, newStatus)}
          />

          <Link
            href={`/cover-letter-ai?appId=${application.id}`}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all shadow-indigo-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Surat Lamaran & Email AI</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsActivityModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Activity</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFollowUpModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Follow Up</span>
          </button>

          <button
            type="button"
            onClick={() => setEditingApplication(application)}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Edit Detail"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm(`Yakin ingin menghapus lamaran ${application.companyName}?`)) {
                deleteApplication(application.id);
                router.push('/applications');
              }
            }}
            className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Documents & Contacts */}
        <div className="space-y-6">
          {/* Application Summary (PRD §18) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500 text-xs">
              Application Summary
            </h3>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Perusahaan</span>
                <span className="font-semibold text-slate-900">{application.companyName}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Posisi</span>
                <span className="font-semibold text-slate-900">{application.position}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Platform</span>
                <span className="font-semibold text-slate-900">{application.platform}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Tanggal Kirim</span>
                <span className="font-semibold text-slate-900">
                  {formatDate(application.appliedDate)} {application.appliedTime || ''}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Durasi Rekrutmen</span>
                <span className="font-semibold text-blue-600">{duration.text}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Sistem Kerja</span>
                <span className="font-semibold text-slate-900">
                  {application.workType} • {application.workArrangement}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Lokasi</span>
                <span className="font-semibold text-slate-900">{application.location || '-'}</span>
              </div>
              {application.salary && (
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Perkiraan Gaji</span>
                  <span className="font-semibold text-emerald-700">{application.salary}</span>
                </div>
              )}
            </div>

            {application.jobUrl && (
              <div className="pt-2">
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-blue-600 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Link Lowongan ↗
                </a>
              </div>
            )}
          </div>

          {/* Documents Used */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dokumen Terlampir
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[11px]">CV yang Digunakan:</span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {cvDoc ? `${cvDoc.documentName} (${cvDoc.version || 'v1'})` : 'Belum ditentukan'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Portfolio:</span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  {portfolioDoc ? portfolioDoc.documentName : 'Tidak dilampirkan'}
                </p>
              </div>

              {coverLetterDoc && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Cover Letter:</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {coverLetterDoc.documentName} ({coverLetterDoc.version || 'v1'})
                  </p>
                </div>
              )}

              <div className="pt-1">
                <Link
                  href={`/cover-letter-ai?appId=${application.id}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Generate Rekomendasi Surat AI</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recruiter Contacts */}
          <ContactCard applicationId={application.id} contacts={application.contacts || []} />

          {/* Notes & Tags */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catatan & Tags
            </h3>

            {application.notes ? (
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {application.notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada catatan tambahan.</p>
            )}

            {application.tags && application.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {application.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Application Timeline History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Application History & Timeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kronologi lengkap seluruh komunikasi, screening, interview, dan respon
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActivityModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Activity</span>
              </button>
            </div>

            {/* Vertical Timeline */}
            <TimelineView activities={appActivities} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {isActivityModalOpen && (
        <AddActivityModal
          applicationId={application.id}
          onClose={() => setIsActivityModalOpen(false)}
        />
      )}

      {isFollowUpModalOpen && (
        <FollowUpModal
          application={application}
          onClose={() => setIsFollowUpModalOpen(false)}
        />
      )}
    </div>
  );
}
