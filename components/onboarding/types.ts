import { LucideIcon } from 'lucide-react';

export interface OnboardingStepConfig {
  id: string;
  title: string;
  desc: string;
  completed: boolean;
  status: string;
  unlocked: boolean;
  icon: LucideIcon;
  color: string;
}

export interface OnboardingStepMeta {
  label: string;
  number: number;
}
