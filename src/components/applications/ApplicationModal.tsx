'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Globe2,
  Calendar,
  FileText,
  Tag,
  Clock,
  Sparkles,
  Link as LinkIcon,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import {
  JobApplication,
  JobPlatform,
  WorkType,
  WorkArrangement,
  ApplicationStatus,
  ApplicationMethod,
} from '@/lib/types';

const PLATFORMS: JobPlatform[] = [
  'LinkedIn',
  'Jobstreet',
  'Glints',
  'Indeed',
  'Company Website',
  'Referral',
  'Email',
  'Other',
];

const WORK_TYPES: WorkType[] = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const WORK_ARRANGEMENTS: WorkArrangement[] = ['Hybrid', 'Remote', 'Onsite'];
const STATUSES: ApplicationStatus[] = [
  'Applied',
  'Screening',
  'Interview',
  'Technical Test',
  'Final Interview',
  'Offer',
  'Hired',
  'Rejected',
  'Withdrawn',
  'On Hold',
];
const METHODS: ApplicationMethod[] = [
  'Easy Apply',
  'Company Portal',
  'Email',
  'Referral',
  'Job Board',
  'Recruiter Direct',
];

const POPULAR_TAGS = [
  'Business Development',
  'Marketplace',
  'E-Commerce',
  'High Priority',
  'Remote',
  'Hybrid',
  'Enterprise',
  'Growth',
];

export const ApplicationModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    editingApplication,
    setEditingApplication,
    addApplication,
    updateApplication,
    documents,
    profile,
  } = useJobTrack();

  const [activeTab, setActiveTab] = useState<'company' | 'source' | 'details' | 'documents' | 'notes'>('company');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('Jakarta');
  const [workType, setWorkType] = useState<WorkType>('Full Time');
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>('Hybrid');
  const [salary, setSalary] = useState('');

  const [platform, setPlatform] = useState<JobPlatform>('LinkedIn');
  const [jobUrl, setJobUrl] = useState('');
  const [dateFound, setDateFound] = useState('');

  const [appliedDate, setAppliedDate] = useState('');
  const [appliedTime, setAppliedTime] = useState('');
  const [applicationMethod, setApplicationMethod] = useState<ApplicationMethod>('Easy Apply');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');

  const [selectedCvId, setSelectedCvId] = useState('');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState('');

  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [followUpDays, setFollowUpDays] = useState(7);
  const [errors, setErrors] = useState<{ companyName?: string; position?: string }>({});

  const isOpen = isAddModalOpen || editingApplication !== null;

  useEffect(() => {
    if (editingApplication) {
      setCompanyName(editingApplication.companyName || '');
      setPosition(editingApplication.position || '');
      setLocation(editingApplication.location || '');
      setWorkType(editingApplication.workType || 'Full Time');
      setWorkArrangement(editingApplication.workArrangement || 'Hybrid');
      setSalary(editingApplication.salary || '');

      setPlatform(editingApplication.platform || 'LinkedIn');
      setJobUrl(editingApplication.jobUrl || '');
      setDateFound(editingApplication.dateFound || '');

      setAppliedDate(editingApplication.appliedDate || '');
      setAppliedTime(editingApplication.appliedTime || '');
      setApplicationMethod(editingApplication.applicationMethod || 'Easy Apply');
      setStatus(editingApplication.status || 'Applied');

      const cvRef = editingApplication.documents.find((d) => d.documentType === 'CV');
      const portRef = editingApplication.documents.find((d) => d.documentType === 'Portfolio');
      const clRef = editingApplication.documents.find((d) => d.documentType === 'Cover Letter');
      setSelectedCvId(cvRef?.documentId || '');
      setSelectedPortfolioId(portRef?.documentId || '');
      setSelectedCoverLetterId(clRef?.documentId || '');

      setNotes(editingApplication.notes || '');
      setTags(editingApplication.tags || []);
      setFollowUpDays(editingApplication.followUpRuleDays || profile.defaultFollowUpDays || 7);
    } else {
      // Smart Defaults for new applications (PRD §44)
      const now = new Date();
      setCompanyName('');
      setPosition('');
      setLocation('Jakarta');
      setWorkType('Full Time');
      setWorkArrangement('Hybrid');
      setSalary('');

      setPlatform('LinkedIn');
      setJobUrl('');
      setDateFound(now.toISOString().slice(0, 10));

      setAppliedDate(now.toISOString().slice(0, 10)); // Today
      setAppliedTime(now.toTimeString().slice(0, 5));
      setApplicationMethod('Easy Apply');
      setStatus('Applied');

      // Auto-select latest/current CV & Portfolio
      const defaultCv = documents.find((d) => d.type === 'CV' && d.isCurrent) || documents.find((d) => d.type === 'CV');
      const defaultPort = documents.find((d) => d.type === 'Portfolio' && d.isCurrent) || documents.find((d) => d.type === 'Portfolio');
      setSelectedCvId(defaultCv?.id || '');
      setSelectedPortfolioId(defaultPort?.id || '');
      setSelectedCoverLetterId('');

      setNotes('');
      setTags(['Business Development']);
      setFollowUpDays(profile.defaultFollowUpDays || 7);
    }
    setActiveTab('company');
    setErrors({});
  }, [editingApplication, isAddModalOpen, documents, profile]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingApplication(null);
  };

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { companyName?: string; position?: string } = {};
    if (!companyName.trim()) newErrors.companyName = 'Nama perusahaan wajib diisi';
    if (!position.trim()) newErrors.position = 'Posisi lowongan wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab('company');
      return;
    }

    // Prepare documents array
    const docRefs: any[] = [];
    if (selectedCvId) {
      const cvDoc = documents.find((d) => d.id === selectedCvId);
      if (cvDoc) {
        docRefs.push({
          documentId: cvDoc.id,
          documentName: cvDoc.name,
          documentType: 'CV',
          version: cvDoc.version,
        });
      }
    }
    if (selectedPortfolioId) {
      const portDoc = documents.find((d) => d.id === selectedPortfolioId);
      if (portDoc) {
        docRefs.push({
          documentId: portDoc.id,
          documentName: portDoc.name,
          documentType: 'Portfolio',
          version: portDoc.version,
        });
      }
    }
    if (selectedCoverLetterId) {
      const clDoc = documents.find((d) => d.id === selectedCoverLetterId);
      if (clDoc) {
        docRefs.push({
          documentId: clDoc.id,
          documentName: clDoc.name,
          documentType: 'Cover Letter',
          version: clDoc.version,
        });
      }
    }

    // Calculate next follow up date
    let calculatedFollowUpDate: string | undefined = undefined;
    if (appliedDate && followUpDays > 0) {
      const d = new Date(appliedDate);
      d.setDate(d.getDate() + Number(followUpDays));
      calculatedFollowUpDate = d.toISOString().slice(0, 10);
    }

    if (editingApplication) {
      updateApplication(editingApplication.id, {
        companyName,
        position,
        location,
        workType,
        workArrangement,
        salary,
        platform,
        jobUrl,
        dateFound,
        appliedDate,
        appliedTime,
        applicationMethod,
        status,
        documents: docRefs,
        notes,
        tags,
        followUpRuleDays: Number(followUpDays),
        nextFollowUpDate: calculatedFollowUpDate,
      });
    } else {
      addApplication({
        companyName,
        position,
        location,
        workType,
        workArrangement,
        salary,
        platform,
        jobUrl,
        dateFound,
        appliedDate,
        appliedTime,
        applicationMethod,
        status,
        documents: docRefs,
        contacts: [],
        notes,
        tags,
        followUpRuleDays: Number(followUpDays),
        nextFollowUpDate: calculatedFollowUpDate,
      });
    }

    handleClose();
  };

  const cvDocuments = documents.filter((d) => d.type === 'CV');
  const portfolioDocuments = documents.filter((d) => d.type === 'Portfolio');
  const coverLetterDocuments = documents.filter((d) => d.type === 'Cover Letter');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              {editingApplication ? 'Edit Lamaran Pekerjaan' : 'Catat Lamaran Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingApplication
                ? 'Perbarui detail data perusahaan dan progres lamaran'
                : 'Isi detail data lamaran untuk melacak progress recruitment'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs (PRD §12 - Multi-Section Form) */}
        <div className="flex border-b border-slate-200 overflow-x-auto px-4 bg-white text-xs font-semibold no-scrollbar">
          {[
            { id: 'company', label: '1. Perusahaan', icon: Building2 },
            { id: 'source', label: '2. Sumber Lowongan', icon: Globe2 },
            { id: 'details', label: '3. Detail Apply', icon: Calendar },
            { id: 'documents', label: '4. Dokumen (CV/Porto)', icon: FileText },
            { id: 'notes', label: '5. Catatan & Tag', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SECTION 1: COMPANY */}
          {activeTab === 'company' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Perusahaan *
                </label>
                <input
                  type="text"
                  placeholder="e.g. PT ABC Indonesia"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors({ ...errors, companyName: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.companyName
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Posisi yang Dilamar *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business Development Specialist"
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value);
                    if (errors.position) setErrors({ ...errors, position: undefined });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.position
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                {errors.position && (
                  <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jakarta Selatan / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Perkiraan Gaji (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rp 10.000.000 - Rp 14.000.000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tipe Pekerjaan
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as WorkType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {WORK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sistem Kerja
                  </label>
                  <select
                    value={workArrangement}
                    onChange={(e) => setWorkArrangement(e.target.value as WorkArrangement)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {WORK_ARRANGEMENTS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: JOB SOURCE */}
          {activeTab === 'source' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Dari mana Anda menemukan lowongan ini?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PLATFORMS.map((p) => {
                    const isSelected = platform === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-sm font-semibold'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Link / URL Lowongan
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tanggal Lowongan Ditemukan
                </label>
                <input
                  type="date"
                  value={dateFound}
                  onChange={(e) => setDateFound(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: APPLICATION DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tanggal Kirim Lamaran * (Smart Default: Hari ini)
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jam Kirim Lamaran
                  </label>
                  <input
                    type="time"
                    value={appliedTime}
                    onChange={(e) => setAppliedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Metode Lamaran
                  </label>
                  <select
                    value={applicationMethod}
                    onChange={(e) => setApplicationMethod(e.target.value as ApplicationMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status Saat Ini
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                  Aturan Jadwal Follow-Up
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={followUpDays}
                    onChange={(e) => setFollowUpDays(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={3}>3 hari setelah lamaran</option>
                    <option value={5}>5 hari setelah lamaran</option>
                    <option value={7}>7 hari setelah lamaran (Rekomendasi)</option>
                    <option value={14}>14 hari setelah lamaran</option>
                    <option value={0}>Tidak perlu follow-up</option>
                  </select>
                  <span className="text-xs text-slate-500">
                    Sistem akan memunculkan badge pengingat saat waktu follow-up tiba.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DOCUMENTS USED */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900">
                <span className="font-semibold">Catatan Versi Dokumen:</span> JobTrack mencatat{' '}
                <strong>versi dokumen spesifik</strong> yang dikirim ke tiap perusahaan, sehingga saat CV Anda
                diperbarui di masa mendatang, arsip riwayat lamaran ini tetap akurat.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Versi CV yang Dikirim
                </label>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Pilih Dokumen CV --</option>
                  {cvDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.version || 'v1'}) {doc.isCurrent ? '★ Current' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Portfolio yang Dilampirkan
                </label>
                <select
                  value={selectedPortfolioId}
                  onChange={(e) => setSelectedPortfolioId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tidak Melampirkan Portfolio / None --</option>
                  {portfolioDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} {doc.externalUrl ? `(${doc.externalUrl})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cover Letter (Opsional)
                </label>
                <select
                  value={selectedCoverLetterId}
                  onChange={(e) => setSelectedCoverLetterId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tidak Menggunakan Cover Letter / None --</option>
                  {coverLetterDocuments.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.version || 'v1'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* SECTION 5: NOTES & TAGS */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Catatan Kualifikasi / Catatan Khusus
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Posisi membutuhkan pengalaman marketplace, business development dan analytical skills..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Label / Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2.5">
                  {POPULAR_TAGS.map((t) => {
                    const isSelected = tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleToggleTag(t)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 font-medium'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${t}` : `+ ${t}`}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tambah tag kustom..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700"
                  >
                    Tambah
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => handleToggleTag(t)}
                          className="hover:text-red-600 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Section:</span>
              <span className="font-semibold text-slate-700 capitalize">{activeTab}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                {editingApplication ? 'Simpan Perubahan' : 'Simpan Lamaran'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
