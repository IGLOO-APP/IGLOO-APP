import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleServiceError(error: unknown, context?: string): never {
  if (context) {
    console.warn(`[${context}]`, error);
  } else {
    console.warn(error);
  }
  throw error;
}
