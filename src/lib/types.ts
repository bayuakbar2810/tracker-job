export type ApplicationStatus =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Technical Test'
  | 'Final Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn'
  | 'On Hold';

export type WorkType = 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Freelance';

export type WorkArrangement = 'Remote' | 'Hybrid' | 'Onsite';

export type JobPlatform =
  | 'LinkedIn'
  | 'Jobstreet'
  | 'Glints'
  | 'Indeed'
  | 'Company Website'
  | 'Referral'
  | 'Email'
  | 'Other';

export type ApplicationMethod =
  | 'Easy Apply'
  | 'Company Portal'
  | 'Email'
  | 'Referral'
  | 'Job Board'
  | 'Recruiter Direct';

export type ActivityType =
  | 'Applied'
  | 'Viewed'
  | 'Recruiter Contact'
  | 'Screening'
  | 'Interview'
  | 'Technical Test'
  | 'Assessment'
  | 'User Interview'
  | 'Follow Up'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Other';

export interface ActivityHistory {
  id: string;
  applicationId: string;
  activityType: ActivityType;
  activityDate: string; // ISO date YYYY-MM-DD
  activityTime?: string; // HH:mm
  channel?: 'Google Meet' | 'Zoom' | 'WhatsApp' | 'Email' | 'Phone' | 'Phone Call' | 'In-Person' | 'LinkedIn' | 'Portal' | 'Other' | string;
  notes?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: 'CV' | 'Portfolio' | 'Cover Letter' | 'Certificate' | 'Other';
  version?: string; // e.g. "v1", "v2", "v3"
  isCurrent?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64 data URL for viewing/downloading the PDF
  externalUrl?: string; // e.g. "https://portofolio-bayuakbar.my.id"
  description?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ApplicationDocumentRef {
  documentId: string;
  documentName: string;
  documentType: 'CV' | 'Portfolio' | 'Cover Letter' | 'Other';
  version?: string;
}

export interface RecruiterContact {
  id: string;
  applicationId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  notes?: string;
}

export interface FollowUpItem {
  id: string;
  applicationId: string;
  companyName: string;
  position: string;
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  channel?: 'LinkedIn' | 'WhatsApp' | 'Email' | 'Phone' | 'Other';
  notes?: string;
  status: 'Pending' | 'Completed' | 'Dismissed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  location: string;
  workType: WorkType;
  workArrangement: WorkArrangement;
  salary?: string;
  platform: JobPlatform;
  jobUrl?: string;
  dateFound?: string;
  appliedDate: string; // YYYY-MM-DD
  appliedTime?: string; // HH:mm
  applicationMethod?: ApplicationMethod;
  status: ApplicationStatus;
  notes?: string;
  tags: string[];
  documents: ApplicationDocumentRef[];
  contacts: RecruiterContact[];
  followUpRuleDays?: number; // e.g., 7 days
  nextFollowUpDate?: string; // calculated or custom YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  phone?: string;
  location?: string;
  defaultFollowUpDays: number;
  geminiApiKey?: string;
}

export interface CVScreeningResult {
  candidateName?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary?: string;
  targetRole?: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    period?: string;
    highlights?: string[];
  }[];
  education?: {
    institution: string;
    degree: string;
    year?: string;
  }[];
  rawTextExcerpt?: string;
}

export interface CoverLetterGenerationResult {
  coverLetter: string;
  emailDraft: {
    subject: string;
    body: string;
  };
  pitchPoints: string[];
  modelUsed: string;
}
