'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { RecruiterContact } from '@/lib/types';
import { useJobTrack } from '@/context/JobTrackContext';

const LinkedinIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ContactCardProps {
  applicationId: string;
  contacts: RecruiterContact[];
}

export const ContactCard: React.FC<ContactCardProps> = ({ applicationId, contacts }) => {
  const { addContact, deleteContact } = useJobTrack();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Talent Acquisition');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addContact(applicationId, {
      name: name.trim(),
      role: role.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setName('');
    setRole('Talent Acquisition');
    setEmail('');
    setPhone('');
    setLinkedinUrl('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Recruiter & Contact
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kontak PIC / Talent Acquisition perusahaan
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 p-1 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in text-xs"
        >
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nama Kontak *</label>
            <input
              type="text"
              placeholder="e.g. Andi Pratama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Jabatan / Role</label>
            <input
              type="text"
              placeholder="e.g. Talent Acquisition Specialist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">WhatsApp / No. Telp</label>
              <input
                type="text"
                placeholder="+62812..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                placeholder="recruiter@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">LinkedIn Profile URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-slate-500 hover:text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Simpan Kontak
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <p className="text-xs text-slate-400 py-2 text-center">
          Belum ada kontak recruiter yang dicatat.
        </p>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => {
            const cleanPhone = c.phone?.replace(/[^0-9]/g, '');
            const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

            return (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                    {c.role && <p className="text-xs text-slate-500">{c.role}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus kontak ${c.name}?`)) {
                        deleteContact(applicationId, c.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1"
                    title="Hapus Kontak"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick actions for WA, Email, LinkedIn */}
                <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                  )}

                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-400" />
                      Email
                    </a>
                  )}

                  {c.linkedinUrl && (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0077b5] bg-blue-50/50 hover:bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg transition-colors"
                    >
                      <LinkedinIcon className="w-3 h-3" />
                      LinkedIn
                    </a>
                  )}
                </div>

                {c.notes && (
                  <p className="text-[11px] text-slate-500 mt-2 bg-white/70 p-2 rounded-lg border border-slate-200/50">
                    {c.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
