import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AppointmentStatus, Frequency, MedicineRoute, FoodRelation, Priority, Severity } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('en-IN', opts ?? {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  ONCE_DAILY: 'Once Daily',
  TWICE_DAILY: 'Twice Daily',
  THRICE_DAILY: 'Thrice Daily',
  FOUR_TIMES_DAILY: 'Four Times Daily',
  AS_NEEDED: 'As Needed (SOS)',
  WEEKLY: 'Once Weekly',
  MONTHLY: 'Once Monthly',
};

export const ROUTE_LABELS: Record<MedicineRoute, string> = {
  ORAL: 'Oral', IV: 'Intravenous (IV)', IM: 'Intramuscular (IM)',
  SC: 'Subcutaneous (SC)', TOPICAL: 'Topical', INHALATION: 'Inhalation',
  SUBLINGUAL: 'Sublingual', RECTAL: 'Rectal', NASAL: 'Nasal',
};

export const FOOD_LABELS: Record<FoodRelation, string> = {
  BEFORE_FOOD: 'Before Food',
  AFTER_FOOD: 'After Food',
  WITH_FOOD: 'With Food',
  NOT_APPLICABLE: 'N/A',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  ROUTINE: 'Routine', URGENT: 'Urgent', STAT: 'STAT',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  MILD: 'Mild', MODERATE: 'Moderate', SEVERE: 'Severe',
};

export function statusLabel(status: AppointmentStatus): string {
  return { SCHEDULED: 'Scheduled', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }[status];
}

export function statusColor(status: AppointmentStatus): string {
  return {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }[status];
}

export function genderLabel(g: string): string {
  return { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' }[g] ?? g;
}
