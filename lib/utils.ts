import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Logs a service error and re-throws it so callers can handle it.
 * Used by Supabase service layer to surface DB errors consistently.
 */
export function handleServiceError(error: unknown, context?: string): never {
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }
  throw error;
}
