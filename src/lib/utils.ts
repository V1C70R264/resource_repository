import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : "-";
  return format(d, 'MMM dd, yyyy');
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : "-";
  return format(d, 'MMM dd, yyyy hh:mm a');
}
