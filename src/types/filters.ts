import type { Category, TransactionType } from './transaction';

export type TimePeriod =
  | 'daily'
  | 'weekly'
  | 'fortnightly'
  | 'monthly'
  | 'yearly'
  | 'all'
  | 'custom';

export interface Filters {
  search: string;
  timePeriod: TimePeriod;
  offset: number; // 0 = current period, -1 = previous, 1 = next, etc.
  dateFrom: string;
  dateTo: string;
  category: Category | 'all';
  type: TransactionType | 'all';
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  timePeriod: 'monthly',
  offset: 0,
  dateFrom: '',
  dateTo: '',
  category: 'all',
  type: 'all',
};
