import type { Filters } from '../types/filters';
import type { Transaction } from '../types/transaction';
import { getDateRange } from './dateRanges';

export function applyFilters(
  transactions: Transaction[],
  filters: Filters
): Transaction[] {
  let result = transactions;

  if (filters.search.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(query));
  }

  if (filters.type !== 'all') {
    result = result.filter((t) => t.type === filters.type);
  }

  if (filters.category !== 'all') {
    result = result.filter((t) => t.category === filters.category);
  }

  if (filters.timePeriod === 'custom') {
    const from = filters.dateFrom || '1900-01-01';
    const to = filters.dateTo || '2999-12-31';
    result = result.filter((t) => t.date >= from && t.date <= to);
  } else {
    const range = getDateRange(filters.timePeriod, filters.offset);
    if (range) {
      result = result.filter(
        (t) => t.date >= range.from && t.date <= range.to
      );
    }
  }

  return result;
}
