import type { Filters } from '../types/filters';
import type { Transaction } from '../types/transaction';

function getDateRange(filters: Filters): { from: string; to: string } | null {
  if (filters.datePreset === 'all') return null;

  const today = new Date();

  if (filters.datePreset === 'this-month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }

  if (filters.datePreset === 'last-30') {
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }

  if (filters.dateFrom || filters.dateTo) {
    return {
      from: filters.dateFrom || '1900-01-01',
      to: filters.dateTo || '2999-12-31',
    };
  }

  return null;
}

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

  const range = getDateRange(filters);
  if (range) {
    result = result.filter((t) => t.date >= range.from && t.date <= range.to);
  }

  return result;
}
