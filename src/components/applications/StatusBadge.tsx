'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ApplicationStatus } from '@/lib/types';
import { getStatusStyle } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus;
  onChange?: (newStatus: ApplicationStatus) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ALL_STATUSES: ApplicationStatus[] = [
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

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onChange,
  interactive = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const style = getStatusStyle(status);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  if (!interactive || !onChange) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${style.badge} ${sizeClasses[size]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {status}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-full border transition-all hover:shadow-sm ${style.badge} ${sizeClasses[size]} cursor-pointer`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <span>{status}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 animate-fade-in text-left">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Ubah Status
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {ALL_STATUSES.map((s) => {
              const itemStyle = getStatusStyle(s);
              const isSelected = s === status;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onChange(s);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 ${
                    isSelected ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${itemStyle.dot}`} />
                    {s}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
