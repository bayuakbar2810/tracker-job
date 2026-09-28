'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  FileText,
  Globe,
  Plus,
  ExternalLink,
  Trash2,
  CheckCircle,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  UploadCloud,
  Download,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { DocumentItem } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function DocumentsPage() {
  const { documents, applications, addDocument, deleteDocument, updateDocument } = useJobTrack();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'CV' | 'Portfolio' | 'Cover Letter' | 'Other'>('CV');
  const [version, setVersion] = useState('v1');
  const [externalUrl, setExternalUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isCurrent, setIsCurrent] = useState(true);

  // PDF File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [uploadedFileData, setUploadedFileData] = useState('');
  const [isAiScreening, setIsAiScreening] = useState(false);

  const cvDocs = documents.filter((d) => d.type === 'CV');
  const portfolioDocs = documents.filter((d) => d.type === 'Portfolio');
  const coverLetterDocs = documents.filter((d) => d.type === 'Cover Letter');

  const countUsage = (docId: string) => {
    return applications.filter((app) =>
      app.documents.some((d) => d.documentId === docId)
    ).length;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Mohon pilih berkas dengan format PDF (.pdf)');
      return;
    }

    setUploadedFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileSize(`${sizeInMb} MB`);

    if (!docName.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setDocName(cleanName);
    }

    // Read file as base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAiScreenFile = async () => {
    if (!uploadedFileData || !uploadedFileName) {
      alert('Pilih file PDF terlebih dahulu.');
      return;
    }
    setIsAiScreening(true);
    try {
      const blob = await (await fetch(uploadedFileData)).blob();
      const formData = new FormData();
      formData.append('file', blob, uploadedFileName);

      const res = await fetch('/api/screen-cv', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data) {
        const skillsText = json.data.skills?.join(', ') || '';
        const summaryText = json.data.summary || '';
        setDescription(`${summaryText}\n\nKeahlian Utama: ${skillsText}`);
        if (json.data.targetRole && (!docName || docName.includes('.pdf'))) {
          setDocName(`CV ${json.data.targetRole}`);
        }
      } else {
        alert(json.error || 'Gagal screening dokumen.');
      }
    } catch (err: any) {
      alert(`Kendala saat screening: ${err.message}`);
    } finally {
      setIsAiScreening(false);
    }
  };

  const handleOpenPdf = (doc: DocumentItem) => {
    const targetUrl = doc.fileData || doc.fileUrl;
    if (!targetUrl) return;

    if (targetUrl.startsWith('data:application/pdf') || targetUrl.startsWith('blob:')) {
      const win = window.open();
      if (win) {
        win.document.title = doc.fileName || doc.name;
        win.document.body.style.margin = '0';
        win.document.body.style.height = '100vh';
        win.document.body.innerHTML = `
          <iframe src="${targetUrl}" style="width:100%;height:100%;border:none;"></iframe>
        `;
      } else {
        const link = document.createElement('a');
        link.href = targetUrl;
        link.download = doc.fileName || `${doc.name}.pdf`;
        link.click();
      }
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  const resetModalForm = () => {
    setDocName('');
    setDocType('CV');
    setVersion('v1');
    setExternalUrl('');
    setDescription('');
    setIsCurrent(true);
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadedFileData('');
    setIsAiScreening(false);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    addDocument({
      name: docName.trim(),
      type: docType,
      version: version.trim() || undefined,
      externalUrl: externalUrl.trim() || undefined,
      description: description.trim() || undefined,
      fileName: uploadedFileName || undefined,
      fileSize: uploadedFileSize || undefined,
      fileData: uploadedFileData || undefined,
      fileUrl: uploadedFileData || undefined,
      isCurrent,
    });

    resetModalForm();
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-600" />
            Document Library & Versioning
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola arsip CV, portfolio web, dan cover letter lengkap dengan sistem pelacakan versi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/cover-letter-ai"
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Surat Lamaran & CV AI</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dokumen Baru</span>
          </button>
        </div>
      </div>

      {/* Info Banner on Versioning */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-blue-950">
            Sistem Versioning Dokumen
          </p>
          <p className="text-blue-800 mt-0.5 leading-relaxed">
            Setiap lamaran mencatat referensi versi spesifik yang dikirimkan. Ketika Anda membuat versi
            CV baru (misal: v3), riwayat lamaran yang menggunakan versi sebelumnya (v1 atau v2) tetap
            tercatat apa adanya tanpa berubah.
          </p>
        </div>
      </div>

      {/* 1. CV SECTION (PRD §26 & §27) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Curriculum Vitae (CV)</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/cover-letter-ai"
              className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload & Screen PDF</span>
            </Link>
            <span className="text-xs font-semibold text-slate-500">{cvDocs.length} berkas</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cvDocs.map((doc) => {
            const usageCount = countUsage(doc.id);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {doc.version || 'v1'}
                        </span>
                        {doc.isCurrent && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ★ Current Version
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{doc.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus dokumen "${doc.name}"?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-colors flex items-center gap-1"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[11px] font-medium text-slate-600">Hapus</span>
                    </button>
                  </div>

                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {(doc.fileData || doc.fileUrl) && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {doc.fileName || 'Berkas PDF'}
                        </span>
                        {doc.fileSize && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            ({doc.fileSize})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(doc)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0 ml-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-blue-50 transition-colors"
                      >
                        <span>Lihat PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Digunakan pada {usageCount} lamaran
                  </span>
                  <span>{formatDate(doc.updatedAt || doc.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PORTFOLIO SECTION (PRD §28) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Portfolio & Case Studies</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {portfolioDocs.length} dokumen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioDocs.map((doc) => {
            const usageCount = countUsage(doc.id);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {doc.externalUrl ? 'Online Website' : 'PDF Deck'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{doc.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus portfolio "${doc.name}"?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-colors flex items-center gap-1"
                      title="Hapus Portfolio"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[11px] font-medium text-slate-600">Hapus</span>
                    </button>
                  </div>

                  {doc.externalUrl && (
                    <a
                      href={doc.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline mt-2"
                    >
                      {doc.externalUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {(doc.fileData || doc.fileUrl) && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {doc.fileName || 'Deck Portofolio (PDF)'}
                        </span>
                        {doc.fileSize && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            ({doc.fileSize})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(doc)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0 ml-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-indigo-50 transition-colors"
                      >
                        <span>Lihat PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Digunakan pada {usageCount} lamaran
                  </span>
                  <span>{formatDate(doc.updatedAt || doc.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. COVER LETTERS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Cover Letters</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/cover-letter-ai"
              className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Buat dengan AI</span>
            </Link>
            <span className="text-xs font-semibold text-slate-500">
              {coverLetterDocs.length} dokumen
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coverLetterDocs.map((doc) => {
            const usageCount = countUsage(doc.id);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {doc.version || 'v1'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{doc.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus cover letter "${doc.name}"?`)) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 transition-colors flex items-center gap-1"
                      title="Hapus Cover Letter"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[11px] font-medium text-slate-600">Hapus</span>
                    </button>
                  </div>

                  {doc.description && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {(doc.fileData || doc.fileUrl) && (
                    <div className="mt-3 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">
                          {doc.fileName || 'Berkas Cover Letter'}
                        </span>
                        {doc.fileSize && (
                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            ({doc.fileSize})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(doc)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 shrink-0 ml-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-emerald-50 transition-colors"
                      >
                        <span>Lihat PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    Digunakan pada {usageCount} lamaran
                  </span>
                  <span>{formatDate(doc.updatedAt || doc.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Tambah Dokumen Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipe Dokumen
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="CV">Curriculum Vitae (CV)</option>
                  <option value="Portfolio">Portfolio</option>
                  <option value="Cover Letter">Cover Letter</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Dokumen *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CV Business Development"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              {/* Upload PDF File Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Upload Berkas PDF (Opsional)</span>
                  {uploadedFileName && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {uploadedFileName} ({uploadedFileSize})
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl p-3.5 text-center cursor-pointer transition-colors"
                >
                  {uploadedFileName ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText className="w-6 h-6 text-rose-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{uploadedFileName}</p>
                          <p className="text-[11px] text-slate-400">{uploadedFileSize} • Berkas PDF Siap Disimpan</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 hover:underline">Ganti Berkas</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-500 py-1">
                      <UploadCloud className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-slate-700">Pilih Berkas PDF (.pdf)</span>
                      <span className="text-[11px] text-slate-400">• Maks. 10MB</span>
                    </div>
                  )}
                </div>

                {uploadedFileData && docType === 'CV' && (
                  <div className="mt-2 flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
                    <span className="text-[11px] text-indigo-900 font-medium">
                      Pindai kualifikasi dari PDF ini dengan AI?
                    </span>
                    <button
                      type="button"
                      disabled={isAiScreening}
                      onClick={handleAiScreenFile}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-60"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{isAiScreening ? 'Memindai...' : 'Pindai AI & Isi Otomatis'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Versi (e.g. v3)
                  </label>
                  <input
                    type="text"
                    placeholder="v3"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jadikan Current Version?
                  </label>
                  <select
                    value={isCurrent ? 'true' : 'false'}
                    onChange={(e) => setIsCurrent(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="true">Ya, versi utama saat ini</option>
                    <option value="false">Tidak, versi lama/arsip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  External URL / Link Web (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://portofolio-bayuakbar.my.id"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deskripsi / Catatan Perubahan
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan keunggulan dokumen versi ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
