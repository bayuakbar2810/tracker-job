import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApplicationStatus, JobPlatform } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string, timeString?: string): string {
  if (!dateString) return "-";
  const dateFormatted = formatDate(dateString);
  if (!timeString) return dateFormatted;
  return `${dateFormatted}, ${timeString}`;
}

export function calculateDaysSince(dateString: string): number {
  if (!dateString) return 0;
  const applied = new Date(dateString);
  const today = new Date();
  applied.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - applied.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDurationBadge(appliedDate: string, status: ApplicationStatus): {
  text: string;
  days: number;
  isRecent: boolean;
} {
  const days = calculateDaysSince(appliedDate);
  let text = "";
  if (status === "Rejected") {
    text = `${days} hari hingga ditolak`;
  } else if (status === "Offer" || status === "Hired") {
    text = `${days} hari proses lamaran`;
  } else if (days === 0) {
    text = "Hari ini";
  } else {
    text = `${days} hari yang lalu`;
  }

  return {
    text,
    days,
    isRecent: days <= 3,
  };
}

export function getFollowUpStatus(scheduledDate?: string): {
  label: "Overdue" | "Today" | "Upcoming" | "Completed" | "None";
  colorClass: string;
  dotColor: string;
  daysDiff: number;
} {
  if (!scheduledDate) {
    return { label: "None", colorClass: "text-slate-500 bg-slate-100", dotColor: "bg-slate-400", daysDiff: 0 };
  }

  const sched = new Date(scheduledDate);
  const today = new Date();
  sched.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((sched.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: "Overdue",
      colorClass: "text-red-700 bg-red-50 border-red-200",
      dotColor: "bg-red-500",
      daysDiff: Math.abs(diffDays),
    };
  } else if (diffDays === 0) {
    return {
      label: "Today",
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
      dotColor: "bg-amber-500",
      daysDiff: 0,
    };
  } else {
    return {
      label: "Upcoming",
      colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      dotColor: "bg-emerald-500",
      daysDiff: diffDays,
    };
  }
}

export function getStatusStyle(status: ApplicationStatus): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  dot: string;
} {
  switch (status) {
    case "Applied":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        badge: "bg-blue-50 text-blue-700 border border-blue-200",
        dot: "bg-blue-500",
      };
    case "Screening":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        badge: "bg-purple-50 text-purple-700 border border-purple-200",
        dot: "bg-purple-500",
      };
    case "Interview":
    case "Final Interview":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        badge: "bg-orange-50 text-orange-700 border border-orange-200",
        dot: "bg-orange-500",
      };
    case "Technical Test":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-500",
      };
    case "Offer":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "Hired":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-900",
        border: "border-emerald-300",
        badge: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold",
        dot: "bg-emerald-600",
      };
    case "Rejected":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        badge: "bg-rose-50 text-rose-700 border border-rose-200",
        dot: "bg-rose-500",
      };
    case "Withdrawn":
    case "On Hold":
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
        badge: "bg-slate-100 text-slate-700 border border-slate-200",
        dot: "bg-slate-400",
      };
  }
}

export function getPlatformBadgeStyle(platform: JobPlatform): string {
  switch (platform) {
    case "LinkedIn":
      return "bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20";
    case "Jobstreet":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Glints":
      return "bg-rose-50 text-rose-600 border-rose-200";
    case "Indeed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Company Website":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Referral":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
