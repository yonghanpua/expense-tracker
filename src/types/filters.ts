import type { Category, TransactionType } from './transaction';

export type DatePreset = 'all' | 'this-month' | 'last-30' | 'custom';

export interface Filters {
  search: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  category: Category | 'all';
  type: TransactionType | 'all';
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
  category: 'all',
  type: 'all',
};
