import { JobApplication, DocumentItem, ActivityHistory, UserProfile } from './types';
import { initialApplications, initialDocuments, initialActivities, initialUserProfile } from './seedData';

const STORAGE_KEYS = {
  APPLICATIONS: 'jobtrack_applications_v1',
  DOCUMENTS: 'jobtrack_documents_v1',
  ACTIVITIES: 'jobtrack_activities_v1',
  PROFILE: 'jobtrack_profile_v1',
  CLEARED_FLAG: 'jobtrack_cleared_flag_v1',
};

export const getStoredApplications = (): JobApplication[] => {
  if (typeof window === 'undefined') return initialApplications;
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!data) {
      if (isCleared) return [];
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
      return initialApplications;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading applications:', e);
    return [];
  }
};

export const saveStoredApplications = (apps: JobApplication[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    if (apps.length === 0) {
      localStorage.setItem(STORAGE_KEYS.CLEARED_FLAG, 'true');
    }
  } catch (e) {
    console.error('Error saving applications:', e);
  }
};

export const getStoredDocuments = (): DocumentItem[] => {
  if (typeof window === 'undefined') return initialDocuments;
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) {
      if (isCleared) return [];
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initialDocuments));
      return initialDocuments;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading documents:', e);
    return [];
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Error saving documents:', e);
  }
};

export const getStoredActivities = (): ActivityHistory[] => {
  if (typeof window === 'undefined') return initialActivities;
  try {
    const isCleared = localStorage.getItem(STORAGE_KEYS.CLEARED_FLAG) === 'true';
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!data) {
      if (isCleared) return [];
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
      return initialActivities;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading activities:', e);
    return [];
  }
};

export const saveStoredActivities = (acts: ActivityHistory[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(acts));
  } catch (e) {
    console.error('Error saving activities:', e);
  }
};

export const getStoredProfile = (): UserProfile => {
  if (typeof window === 'undefined') return initialUserProfile;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialUserProfile));
      return initialUserProfile;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading profile:', e);
    return initialUserProfile;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
};

export const resetToSeedData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CLEARED_FLAG);
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(initialApplications));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(initialDocuments));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialUserProfile));
};

export const clearAllDummyData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLEARED_FLAG, 'true');
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
};
