'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  JobApplication,
  DocumentItem,
  ActivityHistory,
  UserProfile,
  ApplicationStatus,
  RecruiterContact,
} from '@/lib/types';
import {
  getStoredApplications,
  saveStoredApplications,
  getStoredDocuments,
  saveStoredDocuments,
  getStoredActivities,
  saveStoredActivities,
  getStoredProfile,
  saveStoredProfile,
  resetToSeedData,
  clearAllDummyData,
} from '@/lib/storage';
import { BackupData } from '@/lib/exportImport';
import {
  initialApplications,
  initialDocuments,
  initialActivities,
  initialUserProfile,
} from '@/lib/seedData';

interface JobTrackContextType {
  applications: JobApplication[];
  documents: DocumentItem[];
  activities: ActivityHistory[];
  profile: UserProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingApplication: JobApplication | null;
  setEditingApplication: (app: JobApplication | null) => void;

  // Actions
  addApplication: (app: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => JobApplication;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (id: string, newStatus: ApplicationStatus, notes?: string) => void;
  addActivity: (activity: Omit<ActivityHistory, 'id' | 'createdAt'>) => void;
  deleteActivity: (id: string) => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, doc: Partial<DocumentItem>) => void;
  deleteDocument: (id: string) => void;
  addContact: (applicationId: string, contact: Omit<RecruiterContact, 'id' | 'applicationId'>) => void;
  deleteContact: (applicationId: string, contactId: string) => void;
  logFollowUp: (
    applicationId: string,
    channel: 'LinkedIn' | 'WhatsApp' | 'Email' | 'Phone' | 'Other',
    notes: string,
    nextScheduledDate?: string
  ) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  resetAllData: () => void;
  clearAllData: () => void;
  importBackup: (backup: BackupData) => void;
}

const JobTrackContext = createContext<JobTrackContextType | undefined>(undefined);

export const JobTrackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [activities, setActivities] = useState<ActivityHistory[]>(initialActivities);
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setApplications(getStoredApplications());
    setDocuments(getStoredDocuments());
    setActivities(getStoredActivities());
    setProfile(getStoredProfile());
    setIsMounted(true);
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  const addApplication = (appData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): JobApplication => {
    const now = new Date();
    const id = `app-${Date.now()}`;
    
    // Auto calculate next follow up if not specified
    let calculatedFollowUp = appData.nextFollowUpDate;
    if (!calculatedFollowUp && appData.followUpRuleDays) {
      const followUpDate = new Date(appData.appliedDate || now);
      followUpDate.setDate(followUpDate.getDate() + appData.followUpRuleDays);
      calculatedFollowUp = followUpDate.toISOString().slice(0, 10);
    }

    const newApp: JobApplication = {
      ...appData,
      id,
      nextFollowUpDate: calculatedFollowUp,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    saveStoredApplications(updatedApps);

    // Also auto-add 'Applied' activity to timeline
    const newAct: ActivityHistory = {
      id: `act-${Date.now()}`,
      applicationId: id,
      activityType: 'Applied',
      activityDate: appData.appliedDate || now.toISOString().slice(0, 10),
      activityTime: appData.appliedTime || now.toTimeString().slice(0, 5),
      channel: appData.platform === 'LinkedIn' ? 'LinkedIn' : 'Portal',
      notes: `Lamaran berhasil dicatat untuk posisi ${appData.position} di ${appData.companyName}.`,
      createdAt: now.toISOString(),
    };
    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);
    saveStoredActivities(updatedActs);

    if (newApp.status === 'Offer' || newApp.status === 'Hired') {
      triggerCelebration();
    }

    return newApp;
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    const now = new Date();
    const updatedApps = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          ...updates,
          updatedAt: now.toISOString(),
        };
      }
      return app;
    });
    setApplications(updatedApps);
    saveStoredApplications(updatedApps);
  };

  const deleteApplication = (id: string) => {
    const updatedApps = applications.filter((app) => app.id !== id);
    setApplications(updatedApps);
    saveStoredApplications(updatedApps);

    // Also delete associated activities
    const updatedActs = activities.filter((act) => act.applicationId !== id);
    setActivities(updatedActs);
    saveStoredActivities(updatedActs);
  };

  const updateApplicationStatus = (id: string, newStatus: ApplicationStatus, notes?: string) => {
    const targetApp = applications.find((a) => a.id === id);
    if (!targetApp) return;

    const prevStatus = targetApp.status;
    if (prevStatus === newStatus) return;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    // Update app status
    updateApplication(id, { status: newStatus });

    // Map status to activity type
    let actType: any = 'Screening';
    if (newStatus === 'Applied') actType = 'Applied';
    else if (newStatus === 'Interview' || newStatus === 'Final Interview') actType = 'Interview';
    else if (newStatus === 'Technical Test') actType = 'Technical Test';
    else if (newStatus === 'Offer') actType = 'Offer';
    else if (newStatus === 'Hired') actType = 'Offer';
    else if (newStatus === 'Rejected') actType = 'Rejected';
    else if (newStatus === 'Withdrawn') actType = 'Withdrawn';

    // Add activity history
    const newAct: ActivityHistory = {
      id: `act-${Date.now()}`,
      applicationId: id,
      activityType: actType,
      activityDate: todayStr,
      activityTime: timeStr,
      notes: notes || `Status lamaran diperbarui dari ${prevStatus} menjadi ${newStatus}.`,
      createdAt: now.toISOString(),
    };
    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);
    saveStoredActivities(updatedActs);

    if (newStatus === 'Offer' || newStatus === 'Hired') {
      triggerCelebration();
    }
  };

  const addActivity = (actData: Omit<ActivityHistory, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newAct: ActivityHistory = {
      ...actData,
      id: `act-${Date.now()}`,
      createdAt: now.toISOString(),
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    saveStoredActivities(updated);
  };

  const deleteActivity = (id: string) => {
    const updated = activities.filter((act) => act.id !== id);
    setActivities(updated);
    saveStoredActivities(updated);
  };

  const addDocument = (docData: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveStoredDocuments(updated);
  };

  const updateDocument = (id: string, docData: Partial<DocumentItem>) => {
    const now = new Date().toISOString();
    const updated = documents.map((doc) => {
      if (doc.id === id) {
        return { ...doc, ...docData, updatedAt: now };
      }
      return doc;
    });
    setDocuments(updated);
    saveStoredDocuments(updated);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter((doc) => doc.id !== id);
    setDocuments(updated);
    saveStoredDocuments(updated);
  };

  const addContact = (applicationId: string, contactData: Omit<RecruiterContact, 'id' | 'applicationId'>) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const newContact: RecruiterContact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      applicationId,
    };

    const updatedContacts = [...(targetApp.contacts || []), newContact];
    updateApplication(applicationId, { contacts: updatedContacts });
  };

  const deleteContact = (applicationId: string, contactId: string) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const updatedContacts = (targetApp.contacts || []).filter((c) => c.id !== contactId);
    updateApplication(applicationId, { contacts: updatedContacts });
  };

  const logFollowUp = (
    applicationId: string,
    channel: 'LinkedIn' | 'WhatsApp' | 'Email' | 'Phone' | 'Other',
    notes: string,
    nextScheduledDate?: string
  ) => {
    const targetApp = applications.find((a) => a.id === applicationId);
    if (!targetApp) return;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 5);

    // 1. Add follow-up entry in Activity History
    const newAct: ActivityHistory = {
      id: `act-${Date.now()}`,
      applicationId,
      activityType: 'Follow Up',
      activityDate: todayStr,
      activityTime: timeStr,
      channel,
      notes: notes || `Follow-up dilakukan melalui channel ${channel}.`,
      createdAt: now.toISOString(),
    };
    const updatedActs = [newAct, ...activities];
    setActivities(updatedActs);
    saveStoredActivities(updatedActs);

    // 2. Update Application's next follow up date
    updateApplication(applicationId, {
      nextFollowUpDate: nextScheduledDate || undefined,
    });
  };

  const updateProfile = (profileData: Partial<UserProfile>) => {
    const updated = { ...profile, ...profileData };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const resetAllData = () => {
    resetToSeedData();
    setApplications(getStoredApplications());
    setDocuments(getStoredDocuments());
    setActivities(getStoredActivities());
    setProfile(getStoredProfile());
  };

  const clearAllData = () => {
    clearAllDummyData();
    setApplications([]);
    setDocuments([]);
    setActivities([]);
  };

  const importBackup = (backup: BackupData) => {
    if (backup.applications) {
      setApplications(backup.applications);
      saveStoredApplications(backup.applications);
    }
    if (backup.documents) {
      setDocuments(backup.documents);
      saveStoredDocuments(backup.documents);
    }
    if (backup.activities) {
      setActivities(backup.activities);
      saveStoredActivities(backup.activities);
    }
    if (backup.profile) {
      setProfile(backup.profile);
      saveStoredProfile(backup.profile);
    }
  };

  return (
    <JobTrackContext.Provider
      value={{
        applications,
        documents,
        activities,
        profile,
        searchQuery,
        setSearchQuery,
        isAddModalOpen,
        setIsAddModalOpen,
        editingApplication,
        setEditingApplication,
        addApplication,
        updateApplication,
        deleteApplication,
        updateApplicationStatus,
        addActivity,
        deleteActivity,
        addDocument,
        updateDocument,
        deleteDocument,
        addContact,
        deleteContact,
        logFollowUp,
        updateProfile,
        resetAllData,
        clearAllData,
        importBackup,
      }}
    >
      {children}
    </JobTrackContext.Provider>
  );
};

export const useJobTrack = () => {
  const context = useContext(JobTrackContext);
  if (!context) {
    throw new Error('useJobTrack must be used within a JobTrackProvider');
  }
  return context;
};
