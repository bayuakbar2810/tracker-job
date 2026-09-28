'use client';

import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Key,
  ExternalLink,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { exportToCSV, exportToJSON, BackupData } from '@/lib/exportImport';

export default function SettingsPage() {
  const {
    profile,
    updateProfile,
    applications,
    documents,
    activities,
    resetAllData,
    clearAllData,
    importBackup,
  } = useJobTrack();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [phone, setPhone] = useState(profile.phone || '');
  const [location, setLocation] = useState(profile.location || '');
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(
    profile.defaultFollowUpDays || 7
  );
  const [isSaved, setIsSaved] = useState(false);

  const [geminiKey, setGeminiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobtrack_gemini_key') || profile.geminiApiKey || '';
    }
    return profile.geminiApiKey || '';
  });
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobtrack_gemini_key', geminiKey.trim());
    }
    updateProfile({ geminiApiKey: geminiKey.trim() });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      targetRole,
      phone,
      location,
      defaultFollowUpDays,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportJSON = () => {
    exportToJSON(applications, documents, activities, profile);
  };

  const handleExportCSV = () => {
    exportToCSV(applications);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.applications || json.documents) {
          importBackup(json as BackupData);
          alert('Data backup berhasil diimport!');
        } else {
          alert('Format file JSON tidak dikenali.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON. Pastikan format valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          Pengaturan Sistem
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pengaturan profil pelamar kerja, preferensi default, dan backup kepemilikan data.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Profil Pelamar Kerja</h2>
          </div>
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Perubahan Disimpan
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Posisi / Peran Utama
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Business Development & Commercial Specialist"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Domisili / Lokasi
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Jakarta, Indonesia"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* 2. Preferences Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Preferensi Default Aplikasi</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Default Waktu Follow-Up
          </label>
          <select
            value={defaultFollowUpDays}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDefaultFollowUpDays(val);
              updateProfile({ defaultFollowUpDays: val });
            }}
            className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value={3}>3 Hari</option>
            <option value={5}>5 Hari</option>
            <option value={7}>7 Hari (Standar Rekomendasi)</option>
            <option value={14}>14 Hari</option>
          </select>
          <p className="text-xs text-slate-400 mt-1.5">
            Nilai awal yang otomatis diisi ketika membuat lamaran baru.
          </p>
        </div>
      </div>

      {/* AI Integration Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Integrasi Kecerdasan Buatan (AI)</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dual Engine AI Siap
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          JobTrack menyertakan <strong>Smart Pro Engine bawaan</strong> yang dapat langsung digunakan tanpa konfigurasi. Anda juga dapat menghubungkan <strong>Google Gemini Flash AI</strong> untuk rekomendasi surat lamaran, drafting email, dan screening CV PDF dengan penalaran bahasa paling mutakhir.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key (Opsional)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline normal-case flex items-center gap-1"
              >
                <span>Dapatkan API Key Gratis di Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {keySaved ? 'Tersimpan! ✓' : 'Simpan Key'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kunci API disimpan secara lokal di browser Anda dan hanya digunakan untuk memanggil model Gemini saat Anda menekan tombol AI.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Data Ownership & Backup */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Cadangan & Kepemilikan Data
            </h2>
            <p className="text-xs text-slate-500">
              Seluruh data tersimpan secara aman di browser lokal Anda dan dapat diexport kapan saja.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Full Backup (JSON)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Download seluruh lamaran, riwayat timeline, kontak recruiter, dan referensi dokumen.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Backup JSON
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Spreadsheet Export (CSV)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Format tabel yang kompatibel langsung dibuka di Microsoft Excel atau Google Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              className="mt-4 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV Spreadsheet
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <div className="pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore / Import Data dari JSON</span>
          </button>
        </div>

        {/* Danger zone / Reset */}
        {/* Danger zone / Reset & Clear */}
        <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-700">Kelola Data Sample & Reset</p>
            <p className="text-xs text-slate-400">
              Kosongkan seluruh data untuk memulai dari nol, atau muat ulang data sampel demo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Hapus dan bersihkan semua data (lamaran, dokumen, riwayat)? Data akan benar-benar dikosongkan.'
                  )
                ) {
                  clearAllData();
                  alert('Seluruh data berhasil dibersihkan.');
                }
              }}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Seluruh Data</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Kembalikan seluruh data ke sample demo awal? Data perubahan saat ini akan diganti dengan data sampel.'
                  )
                ) {
                  resetAllData();
                  alert('Data berhasil di-reset ke sample demo data!');
                }
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Sample Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
