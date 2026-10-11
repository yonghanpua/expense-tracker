import type { TimePeriod } from '../types/filters';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday start
  const result = new Date(d);
  result.setDate(result.getDate() - diff);
  return result;
}

export interface DateRange {
  from: string;
  to: string;
  label: string;
}

export function getDateRange(
  period: TimePeriod,
  offset: number
): DateRange | null {
  if (period === 'all' || period === 'custom') return null;

  const now = new Date();
  let from: Date;
  let to: Date;
  let label: string;

  switch (period) {
    case 'daily': {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      from = d;
      to = d;
      const isToday = offset === 0;
      const isYesterday = offset === -1;
      label = isToday
        ? 'Today'
        : isYesterday
          ? 'Yesterday'
          : d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
      break;
    }
    case 'weekly': {
      const base = startOfWeek(now);
      base.setDate(base.getDate() + offset * 7);
      from = base;
      to = new Date(base);
      to.setDate(to.getDate() + 6);
      const fromStr = from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const toStr = to.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      label = offset === 0 ? `This Week` : `${fromStr} – ${toStr}`;
      break;
    }
    case 'fortnightly': {
      const base = startOfWeek(now);
      base.setDate(base.getDate() + offset * 14);
      from = base;
      to = new Date(base);
      to.setDate(to.getDate() + 13);
      const fromStr = from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const toStr = to.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      label = `${fromStr} – ${toStr}`;
      break;
    }
    case 'monthly': {
      const m = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      from = m;
      to = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      label = m.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      break;
    }
    case 'yearly': {
      const year = now.getFullYear() + offset;
      from = new Date(year, 0, 1);
      to = new Date(year, 11, 31);
      label = String(year);
      break;
    }
  }

  return { from: toISODate(from), to: toISODate(to), label };
}

export interface PeriodOption {
  offset: number;
  label: string;
}

export function getPeriodOptions(period: TimePeriod): PeriodOption[] {
  if (period === 'all' || period === 'custom' || period === 'daily')
    return [];

  const count = period === 'yearly' ? 10 : 24;
  const options: PeriodOption[] = [];
  for (let i = 0; i >= -(count - 1); i--) {
    const range = getDateRange(period, i);
    if (range) options.push({ offset: i, label: range.label });
  }
  return options;
}

export function formatCustomRange(dateFrom: string, dateTo: string): string {
  if (!dateFrom && !dateTo) return 'Select dates';
  const parts: string[] = [];
  if (dateFrom) {
    parts.push(
      new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }
  parts.push('–');
  if (dateTo) {
    parts.push(
      new Date(dateTo + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }
  return parts.join(' ');
}
