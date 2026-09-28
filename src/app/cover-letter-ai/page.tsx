'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  Mail,
  UploadCloud,
  CheckCircle,
  Copy,
  Download,
  Printer,
  Save,
  ArrowRight,
  Building2,
  Briefcase,
  Globe,
  Sliders,
  AlertCircle,
  FileCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Key,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { generateCoverLetterAndEmail, screenCVContent } from '@/lib/aiGenerator';
import { CVScreeningResult, CoverLetterGenerationResult } from '@/lib/types';

function AICoverLetterContent() {
  const searchParams = useSearchParams();
  const appIdParam = searchParams.get('appId');

  const { applications, documents, profile, addDocument } = useJobTrack();

  // State: Source Selection
  const [selectedAppId, setSelectedAppId] = useState<string>(appIdParam || '');

  // State: Form Inputs
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [recruiterName, setRecruiterName] = useState('Tim Rekrutmen / HRD');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [senderEmail, setSenderEmail] = useState(profile.email || 'bayu.akbar@example.com');
  const [jobRequirements, setJobRequirements] = useState('');
  const [selectedCvDocId, setSelectedCvDocId] = useState('');
  const [selectedPortfolioUrl, setSelectedPortfolioUrl] = useState('https://portofolio-bayuakbar.my.id');
  const [tone, setTone] = useState<'formal' | 'modern' | 'direct'>('formal');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // State: PDF CV Upload & Screening
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScreening, setIsScreening] = useState(false);
  const [screenedCV, setScreenedCV] = useState<CVScreeningResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // State: AI Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<CoverLetterGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'coverLetter' | 'email' | 'pitch'>('coverLetter');

  // State: Notification / Feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (profile.email) {
      setSenderEmail(profile.email);
    }
  }, [profile.email]);

  const getGmailComposeUrl = () => {
    if (!generationResult) return '#';
    const params = new URLSearchParams();
    params.set('view', 'cm');
    params.set('fs', '1');
    if (recruiterEmail.trim()) {
      params.set('to', recruiterEmail.trim());
    }
    params.set('su', generationResult.emailDraft.subject);
    params.set('body', generationResult.emailDraft.body);
    if (senderEmail && senderEmail.includes('@')) {
      params.set('authuser', senderEmail.trim());
    }
    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  // Gemini API Key from localStorage or profile
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('jobtrack_gemini_key') || profile.geminiApiKey || '';
      setApiKey(storedKey);
    }
  }, [profile.geminiApiKey]);

  // Available CVs and Portfolios from context
  const cvDocs = documents.filter((d) => d.type === 'CV');
  const portfolioDocs = documents.filter((d) => d.type === 'Portfolio');

  // Pre-fill when selectedAppId changes
  useEffect(() => {
    if (selectedAppId) {
      const targetApp = applications.find((a) => a.id === selectedAppId);
      if (targetApp) {
        setCompanyName(targetApp.companyName);
        setPosition(targetApp.position);
        if (targetApp.notes) {
          setJobRequirements(targetApp.notes);
        }
        if (targetApp.contacts && targetApp.contacts.length > 0) {
          const c = targetApp.contacts[0];
          setRecruiterName(c.name || 'Tim Rekrutmen / HRD');
          setRecruiterEmail(c.email || '');
        }
        // Match CV doc if linked
        const linkedCv = targetApp.documents.find((d) => d.documentType === 'CV');
        if (linkedCv) {
          setSelectedCvDocId(linkedCv.documentId);
        }
        // Match Portfolio if linked
        const linkedPorto = targetApp.documents.find((d) => d.documentType === 'Portfolio');
        if (linkedPorto) {
          const docItem = documents.find((doc) => doc.id === linkedPorto.documentId);
          if (docItem?.externalUrl) {
            setSelectedPortfolioUrl(docItem.externalUrl);
          }
        }
      }
    }
  }, [selectedAppId, applications, documents]);

  // Set default CV and portfolio if not set
  useEffect(() => {
    if (!selectedCvDocId && cvDocs.length > 0) {
      const current = cvDocs.find((c) => c.isCurrent) || cvDocs[0];
      setSelectedCvDocId(current.id);
    }
    if (!selectedPortfolioUrl && portfolioDocs.length > 0) {
      const online = portfolioDocs.find((p) => p.externalUrl);
      if (online?.externalUrl) {
        setSelectedPortfolioUrl(online.externalUrl);
      }
    }
  }, [cvDocs, portfolioDocs, selectedCvDocId, selectedPortfolioUrl]);

  // Handle PDF Upload & Screening
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Mohon pilih berkas berformat PDF (.pdf)');
      return;
    }

    setUploadedFileName(file.name);
    setIsScreening(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (apiKey) formData.append('apiKey', apiKey);

      const res = await fetch('/api/screen-cv', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        setScreenedCV(json.data);
        // Pre-fill target role if empty
        if (json.data.targetRole && !position) {
          setPosition(json.data.targetRole);
        }
      } else {
        throw new Error(json.error || 'Gagal screening CV');
      }
    } catch (err: any) {
      console.warn('PDF screening via server route failed, falling back to client heuristic:', err);
      // Fallback: screen based on filename and user profile
      const fallbackResult = await screenCVContent(`Curriculum Vitae ${profile.name}\n${profile.targetRole}\nSkills: Business Development, Marketplace, Partnership, Negotiation\nPengalaman: Strategic Partnership & Expansion`, apiKey);
      setScreenedCV(fallbackResult);
    } finally {
      setIsScreening(false);
    }
  };

  // Save Screened CV to Document Library
  const handleSaveScreenedCV = () => {
    if (!screenedCV) return;
    const docName = screenedCV.targetRole
      ? `CV ${screenedCV.targetRole} (${uploadedFileName || 'PDF Upload'})`
      : `CV ${profile.name} (Screened PDF)`;

    addDocument({
      name: docName,
      type: 'CV',
      version: `v${cvDocs.length + 1}`,
      description: screenedCV.summary || `Hasil screening AI: ${screenedCV.skills.slice(0, 4).join(', ')}`,
      isCurrent: true,
    });
    alert(`Berkas CV "${docName}" berhasil ditambahkan ke Document Library Anda!`);
  };

  // Handle AI Cover Letter & Email Generation
  const handleGenerate = async () => {
    if (!companyName.trim()) {
      alert('Mohon masukkan nama PT / Perusahaan yang dilamar.');
      return;
    }
    if (!position.trim()) {
      alert('Mohon masukkan posisi yang dilamar.');
      return;
    }

    setIsGenerating(true);
    setSavedFeedback(false);

    try {
      // Determine CV details
      let cvVersionName = 'CV Utama';
      let cvSkills: string[] = ['Business Development', 'Marketplace', 'Partnership', 'Data Analysis'];
      let cvSummary = 'Profesional yang berfokus pada pertumbuhan bisnis dan kemitraan.';

      if (screenedCV) {
        cvVersionName = `CV Hasil Screening PDF (${uploadedFileName || 'Terbaru'})`;
        cvSkills = screenedCV.skills;
        cvSummary = screenedCV.summary || cvSummary;
      } else if (selectedCvDocId) {
        const found = cvDocs.find((c) => c.id === selectedCvDocId);
        if (found) {
          cvVersionName = `${found.name} ${found.version || ''}`;
          if (found.description) {
            cvSummary = found.description;
          }
        }
      }

      const params = {
        companyName: companyName.trim(),
        position: position.trim(),
        recruiterName: recruiterName.trim() || 'Tim Rekrutmen / HRD',
        recruiterEmail: recruiterEmail.trim() || undefined,
        jobRequirements: jobRequirements.trim() || undefined,
        cvVersionName,
        cvSkills,
        cvSummary,
        portfolioUrl: selectedPortfolioUrl.trim() || 'https://portofolio-bayuakbar.my.id',
        tone,
        language,
        userProfile: profile,
        geminiApiKey: apiKey || undefined,
      };

      const result = await generateCoverLetterAndEmail(params);
      setGenerationResult(result);
    } catch (err: any) {
      alert(`Terjadi kendala saat generate: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Save generated cover letter to documents
  const handleSaveToDocuments = () => {
    if (!generationResult) return;
    addDocument({
      name: `Surat Lamaran - ${position} di ${companyName}`,
      type: 'Cover Letter',
      version: `v1 (${language.toUpperCase()})`,
      description: `Rekomendasi AI untuk ${companyName} (${tone} tone). Disimpan pada ${new Date().toLocaleDateString('id-ID')}.`,
      isCurrent: true,
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  // Download as text file
  const handleDownloadTxt = () => {
    if (!generationResult) return;
    const blob = new Blob([generationResult.coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Surat_Lamaran_${companyName.replace(/\s+/g, '_')}_${position.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print Cover Letter
  const handlePrint = () => {
    if (!generationResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Surat Lamaran - ${companyName}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; padding: 40px; color: #111; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${generationResult.coverLetter}</pre>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Career Assistant Pro</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Rekomendasi Surat Lamaran & Email AI
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Buat surat lamaran resmi, draft email pengiriman, serta poin kecocokan profil secara otomatis yang disesuaikan presisi dengan PT yang dilamar, posisi, CV, dan portofolio Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-sm transition-all"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>{apiKey ? 'API Key: Terpasang' : 'Kunci Google Gemini'}</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-200 text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dual Engine AI Aktif</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context Form & PDF Screening (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: PDF CV Screening */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Upload & Screen CV (PDF)
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                AI Parser
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Unggah berkas CV format PDF untuk mengekstrak keahlian dan kualifikasi secara otomatis ke dalam prompt surat lamaran.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePdfUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition-colors"
            >
              {isScreening ? (
                <div className="py-3 flex flex-col items-center gap-2 text-blue-600">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-bold">AI sedang menganalisis dokumen CV PDF Anda...</span>
                </div>
              ) : screenedCV ? (
                <div className="py-2 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      {uploadedFileName || 'CV PDF Berhasil Di-Screen'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Ganti Berkas
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {screenedCV.summary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {screenedCV.skills.slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                        {sk}
                      </span>
                    ))}
                    {screenedCV.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400">+{screenedCV.skills.length - 4}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center gap-1.5 text-slate-600">
                  <UploadCloud className="w-7 h-7 text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">Klik untuk upload CV (.PDF)</span>
                  <span className="text-[11px] text-slate-400">Maks. 10MB • AI akan mengekstrak otomatis</span>
                </div>
              )}
            </div>

            {screenedCV && (
              <button
                type="button"
                onClick={handleSaveScreenedCV}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Hasil Screen ke Document Library</span>
              </button>
            )}
          </div>

          {/* Card 2: Configuration Form */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Target & Konfigurasi Lamaran
            </h2>

            {/* Quick Picker from Existing Applications */}
            {applications.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih dari Lamaran Tersimpan (Otomatis Isi)
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-800"
                >
                  <option value="">-- Ketik Manual / Target Baru --</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.companyName} — {app.position} ({app.platform})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama PT / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT ABC Indonesia"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Posisi yang Dilamar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Business Development"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Penerima / Recruiter
                </label>
                <input
                  type="text"
                  placeholder="Contoh: HR Manager / Ibu Sarah"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Tujuan (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="recruitment@ptabc.co.id"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Document References */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Versi CV Rujukan
                </label>
                <select
                  value={selectedCvDocId}
                  onChange={(e) => setSelectedCvDocId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {screenedCV && (
                    <option value="screened">
                      📄 Gunakan Data CV PDF yang Baru Di-Screen ({uploadedFileName})
                    </option>
                  )}
                  {cvDocs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.name} ({cv.version || 'v1'}) {cv.isCurrent ? '⭐ [Current]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tautan Portofolio Pelamar
                </label>
                <input
                  type="text"
                  value={selectedPortfolioUrl}
                  onChange={(e) => setSelectedPortfolioUrl(e.target.value)}
                  placeholder="https://portofolio-bayuakbar.my.id"
                  className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Tone & Language */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gaya Bahasa / Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-2.5 py-2 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="formal">Resmi & Korporat</option>
                  <option value="modern">Modern & Startup</option>
                  <option value="direct">Ringkas & To-the-point</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bahasa
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-slate-200 px-2.5 py-2 bg-slate-50 focus:bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English (Professional)</option>
                </select>
              </div>
            </div>

            {/* Job Requirements Snippet (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Catatan / Poin Lowongan (Opsional)
              </label>
              <textarea
                rows={2}
                value={jobRequirements}
                onChange={(e) => setJobRequirements(e.target.value)}
                placeholder="Contoh: Menguasai partnership marketplace, terbiasa target bulanan, negosiasi klien..."
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>AI Sedang Menyusun Rekomendasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Surat Lamaran & Email AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {generationResult ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden flex flex-col min-h-[580px]">
              {/* Output Header & Tabs */}
              <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">
                    Model: <strong className="text-white">{generationResult.modelUsed}</strong>
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('coverLetter')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'coverLetter'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Surat Lamaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('email')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'email'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Draft Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('pitch')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activeTab === 'pitch'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>AI Pitch Points</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Surat Lamaran */}
              {activeTab === 'coverLetter' && (
                <div className="flex-1 flex flex-col p-6 space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">
                      Surat Lamaran Resmi untuk <strong>{companyName}</strong>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(generationResult.coverLetter, 'letter')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copyFeedback === 'letter' ? 'Tersalin! ✓' : 'Salin Teks'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveToDocuments}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savedFeedback ? 'Tersimpan! ✓' : 'Simpan ke Dokumen'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadTxt}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="Download TXT"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="Print / Cetak"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Letter Sheet Display */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 font-serif text-slate-800 text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-200">
                    {generationResult.coverLetter}
                  </div>
                </div>
              )}

              {/* Tab 2: Draft Email Lamaran */}
              {activeTab === 'email' && (
                <div className="flex-1 flex flex-col p-6 space-y-4">
                  {/* Gmail Direct Dispatcher Card */}
                  <div className="bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border border-rose-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        <Mail className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase block">
                          Buka di Akun Gmail Pribadi Anda
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-slate-500">Dari:</span>
                          <input
                            type="email"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            placeholder="email.anda@gmail.com"
                            className="text-xs font-bold text-slate-900 bg-white/80 border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-hidden focus:border-rose-500 focus:bg-white"
                            title="Email Gmail pribadi pengirim"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getGmailComposeUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all active:scale-95"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Buka di Gmail Langsung</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`mailto:${recruiterEmail || ''}?subject=${encodeURIComponent(
                          generationResult.emailDraft.subject
                        )}&body=${encodeURIComponent(generationResult.emailDraft.body)}`}
                        className="p-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                        title="Buka via aplikasi email bawaan (Outlook / Apple Mail)"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Subject Line Box */}
                  <div className="bg-blue-50/50 border border-blue-200/70 rounded-xl p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase block">
                        Subjek Email (Standar HR)
                      </span>
                      <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                        {generationResult.emailDraft.subject}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(generationResult.emailDraft.subject, 'subject')}
                      className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-bold transition-colors shrink-0"
                    >
                      {copyFeedback === 'subject' ? 'Tersalin! ✓' : 'Salin Subjek'}
                    </button>
                  </div>

                  {/* Email Body Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">
                      Isi Pesan Email Lamaran
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopy(generationResult.emailDraft.body, 'body')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copyFeedback === 'body' ? 'Tersalin! ✓' : 'Salin Isi Email'}</span>
                    </button>
                  </div>

                  {/* Email Body Content */}
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                    {generationResult.emailDraft.body}
                  </div>

                  {/* Tip Callout */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Tips Pengiriman Email:</strong> Pastikan Anda telah melampirkan file PDF CV Anda sebelum menekan tombol kirim di aplikasi email. Tautan portofolio sudah terpasang otomatis di dalam badan email.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: AI Pitch Points */}
              {activeTab === 'pitch' && (
                <div className="flex-1 flex flex-col p-6 space-y-4">
                  <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Analisis Kecocokan CV & Portofolio Anda
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gunakan poin-poin berikut saat interview atau sesi perkenalan diri dengan HR {companyName}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(generationResult.pitchPoints.join('\n\n'), 'pitch')}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copyFeedback === 'pitch' ? 'Tersalin! ✓' : 'Salin Semua'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {generationResult.pitchPoints.map((point, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/40 border border-blue-100 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                          {point}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Portofolio Rujukan: {selectedPortfolioUrl}
                    </span>
                    <a
                      href={selectedPortfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty Placeholder State */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle p-12 text-center flex flex-col items-center justify-center min-h-[520px] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Studio AI Siap Menyusun Rekomendasi
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih lamaran tersimpan atau masukkan nama PT serta posisi di panel kiri, lalu klik tombol <strong>"Generate Surat Lamaran & Email AI"</strong>.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] text-slate-400">
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  ✨ Sesuai PT & Posisi
                </span>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  📄 Integrasi CV & Portofolio
                </span>
                <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  🔍 PDF CV Screening
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                Kunci API Google Gemini (Opsional)
              </h3>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              JobTrack telah dilengkapi <strong>Smart Pro Engine bawaan</strong> yang siap dipakai tanpa API key. Namun jika Anda ingin menggunakan model <strong>Google Gemini 1.5/2.0 Flash</strong> untuk daya penalaran bahasa paling canggih, Anda dapat memasukkan API Key gratis dari Google AI Studio di sini.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Dapatkan API Key Gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('jobtrack_gemini_key');
                    setApiKey('');
                    setShowApiKeyModal(false);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Hapus Key
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jobtrack_gemini_key', apiKey.trim());
                    }
                    setShowApiKeyModal(false);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AICoverLetterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat Studio AI...</div>}>
      <AICoverLetterContent />
    </Suspense>
  );
}
