'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  LayoutList,
  Kanban,
  Download,
  Calendar,
  X,
} from 'lucide-react';
import { useJobTrack } from '@/context/JobTrackContext';
import { ApplicationTable } from '@/components/applications/ApplicationTable';
import { ApplicationKanban } from '@/components/applications/ApplicationKanban';
import { exportToCSV, exportToJSON } from '@/lib/exportImport';
import { JobPlatform, WorkArrangement, ApplicationStatus } from '@/lib/types';

type TabType = 'All' | 'Active' | 'Interview' | 'Follow Up' | 'Closed';

export default function ApplicationsPage() {
  const {
    applications,
    documents,
    activities,
    profile,
    setIsAddModalOpen,
    searchQuery,
    setSearchQuery,
    clearAllData,
  } = useJobTrack();

  const [currentTab, setCurrentTab] = useState<TabType>('All');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [arrangementFilter, setArrangementFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('All');

  // Collect all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => a.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [applications]);

  // Filter logic
  const filteredApplications = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return applications.filter((app) => {
      // 1. Tab filter
      if (currentTab === 'Active') {
        if (['Rejected', 'Withdrawn', 'Hired'].includes(app.status)) return false;
      } else if (currentTab === 'Interview') {
        if (!['Interview', 'Final Interview', 'Technical Test'].includes(app.status)) return false;
      } else if (currentTab === 'Follow Up') {
        if (!app.nextFollowUpDate || app.nextFollowUpDate > todayStr) return false;
        if (['Rejected', 'Withdrawn', 'Hired'].includes(app.status)) return false;
      } else if (currentTab === 'Closed') {
        if (!['Rejected', 'Withdrawn', 'Hired'].includes(app.status)) return false;
      }

      // 2. Search query (company, position, platform, notes, recruiter name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = app.companyName.toLowerCase().includes(q);
        const matchPosition = app.position.toLowerCase().includes(q);
        const matchPlatform = app.platform.toLowerCase().includes(q);
        const matchNotes = app.notes?.toLowerCase().includes(q) || false;
        const matchRecruiter = app.contacts?.some((c) => c.name.toLowerCase().includes(q)) || false;
        const matchTag = app.tags?.some((t) => t.toLowerCase().includes(q)) || false;

        if (!matchCompany && !matchPosition && !matchPlatform && !matchNotes && !matchRecruiter && !matchTag) {
          return false;
        }
      }

      // 3. Dropdown filters
      if (platformFilter !== 'All' && app.platform !== platformFilter) return false;
      if (arrangementFilter !== 'All' && app.workArrangement !== arrangementFilter) return false;
      if (tagFilter !== 'All' && !app.tags?.includes(tagFilter)) return false;

      return true;
    });
  }, [applications, currentTab, searchQuery, platformFilter, arrangementFilter, tagFilter]);

  const handleExportCSV = () => {
    exportToCSV(applications);
  };

  const handleExportJSON = () => {
    exportToJSON(applications, documents, activities, profile);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setPlatformFilter('All');
    setArrangementFilter('All');
    setTagFilter('All');
  };

  const isFiltered =
    searchQuery !== '' ||
    platformFilter !== 'All' ||
    arrangementFilter !== 'All' ||
    tagFilter !== 'All';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola dan filter seluruh lamaran kerja dengan tampilan tabel atau kanban board.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {applications.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Hapus semua data demo dan mulai dari kosong?')) {
                  clearAllData();
                }
              }}
              className="px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-colors"
              title="Hapus data demo"
            >
              <span>Hapus Data Demo</span>
            </button>
          )}

          {/* Export button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-subtle flex items-center gap-1.5 transition-colors"
            title="Export ke CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Add application button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Tabs, View Mode, Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* PRD §29 Tabs: [ All ] [ Active ] [ Interview ] [ Follow Up ] [ Closed ] */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {(['All', 'Active', 'Interview', 'Follow Up', 'Closed'] as TabType[]).map((tab) => {
              const isActive = currentTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCurrentTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher (Table vs Kanban) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel"
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kanban Pipeline"
              >
                <Kanban className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari perusahaan / posisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Platform filter */}
          <div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="All">Semua Platform</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Jobstreet">Jobstreet</option>
              <option value="Glints">Glints</option>
              <option value="Indeed">Indeed</option>
              <option value="Company Website">Company Website</option>
              <option value="Referral">Referral</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Work Arrangement filter */}
          <div>
            <select
              value={arrangementFilter}
              onChange={(e) => setArrangementFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="All">Semua Sistem Kerja</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          {/* Tag filter */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="All">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isFiltered && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>
              Menampilkan <strong>{filteredApplications.length}</strong> dari {applications.length} lamaran
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <ApplicationTable applications={filteredApplications} />
      ) : (
        <ApplicationKanban applications={filteredApplications} />
      )}
    </div>
  );
}
