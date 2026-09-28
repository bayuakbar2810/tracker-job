import { JobApplication, DocumentItem, ActivityHistory, UserProfile } from './types';

export interface BackupData {
  version: string;
  exportDate: string;
  profile: UserProfile;
  applications: JobApplication[];
  documents: DocumentItem[];
  activities: ActivityHistory[];
}

export function exportToJSON(
  applications: JobApplication[],
  documents: DocumentItem[],
  activities: ActivityHistory[],
  profile: UserProfile
) {
  const data: BackupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    profile,
    applications,
    documents,
    activities,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `JobTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCSV(applications: JobApplication[]) {
  const headers = [
    'ID',
    'Perusahaan',
    'Posisi',
    'Lokasi',
    'Tipe Kerja',
    'Sistem Kerja',
    'Gaji',
    'Platform',
    'Tanggal Apply',
    'Jam Apply',
    'Status',
    'Metode Apply',
    'Link Lowongan',
    'Catatan',
    'Tags',
    'Aturan Follow Up (Hari)',
    'Next Follow Up',
  ];

  const rows = applications.map((app) => [
    app.id,
    `"${(app.companyName || '').replace(/"/g, '""')}"`,
    `"${(app.position || '').replace(/"/g, '""')}"`,
    `"${(app.location || '').replace(/"/g, '""')}"`,
    app.workType,
    app.workArrangement,
    `"${(app.salary || '').replace(/"/g, '""')}"`,
    app.platform,
    app.appliedDate,
    app.appliedTime || '',
    app.status,
    app.applicationMethod || '',
    `"${(app.jobUrl || '').replace(/"/g, '""')}"`,
    `"${(app.notes || '').replace(/"/g, '""')}"`,
    `"${(app.tags || []).join('; ')}"`,
    app.followUpRuleDays || '',
    app.nextFollowUpDate || '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodedUri);
  downloadAnchor.setAttribute(
    'download',
    `JobTrack_Applications_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
