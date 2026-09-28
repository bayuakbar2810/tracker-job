'use client';

import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Clock,
  MapPin,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { getDurationBadge, getPlatformBadgeStyle, formatDate } from '@/lib/utils';
import { useJobTrack } from '@/context/JobTrackContext';

interface ApplicationTableProps {
  applications: JobApplication[];
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({ applications }) => {
  const { updateApplicationStatus, deleteApplication, setEditingApplication } = useJobTrack();

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-subtle">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800">Tidak ada lamaran ditemukan</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Coba sesuaikan kata kunci pencarian atau filter yang sedang aktif, atau tambahkan lamaran baru.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-5">Perusahaan & Posisi</th>
              <th className="py-3.5 px-4">Platform</th>
              <th className="py-3.5 px-4">Sistem & Lokasi</th>
              <th className="py-3.5 px-4">Tanggal Apply</th>
              <th className="py-3.5 px-4">Dokumen CV</th>
              <th className="py-3.5 px-4">Status (1-Click)</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => {
              const duration = getDurationBadge(app.appliedDate, app.status);
              const platformStyle = getPlatformBadgeStyle(app.platform);
              const cvDoc = app.documents.find((d) => d.documentType === 'CV');

              return (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Company & Position */}
                  <td className="py-4 px-5">
                    <div className="flex items-start gap-2.5">
                      <div>
                        <Link
                          href={`/applications/${app.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition-colors block text-sm"
                        >
                          {app.companyName}
                        </Link>
                        <p className="text-xs text-slate-600 font-medium">{app.position}</p>
                        {app.tags && app.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {app.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                            {app.tags.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{app.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${platformStyle}`}
                    >
                      {app.platform}
                    </span>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-slate-400 hover:text-blue-600 ml-1.5 text-xs"
                        title="Buka posting lowongan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </td>

                  {/* Work Arrangement & Location */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{app.workArrangement}</p>
                    <p className="text-[11px] text-slate-400">{app.location || '-'}</p>
                  </td>

                  {/* Applied Date & Duration */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs">
                    <p className="text-slate-800 font-medium">{formatDate(app.appliedDate)}</p>
                    <span
                      className={`inline-block text-[11px] font-medium ${
                        duration.isRecent ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    >
                      {duration.text}
                    </span>
                  </td>

                  {/* CV Used */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                    {cvDoc ? (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]" title={cvDoc.documentName}>
                          {cvDoc.documentName} {cvDoc.version ? `(${cvDoc.version})` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>

                  {/* Status with 1-click update */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge
                      status={app.status}
                      interactive={true}
                      onChange={(newStatus) => updateApplicationStatus(app.id, newStatus)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/applications/${app.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Lihat Detail & Timeline"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingApplication(app)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Lamaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus catatan lamaran di ${app.companyName}?`)) {
                            deleteApplication(app.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Lamaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
