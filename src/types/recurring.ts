import type { Category, PaymentMethod, TransactionType } from './transaction';

export type Frequency = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export interface RecurringRule {
  id: string;
  title: string;
  amount: number;
  category: Category;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  frequency: Frequency;
  nextDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
}

export function advanceDate(date: string, frequency: Frequency): string {
  const d = new Date(date + 'T00:00:00');
  switch (frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'fortnightly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
}
