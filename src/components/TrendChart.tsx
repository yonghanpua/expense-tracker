import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import type { TimePeriod } from '../types/filters';
import type { Transaction } from '../types/transaction';

interface TrendChartProps {
  transactions: Transaction[];
  timePeriod: TimePeriod;
}

interface BucketData {
  label: string;
  expenses: number;
  income: number;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split('T')[0];
}

function bucketTransactions(
  transactions: Transaction[],
  timePeriod: TimePeriod
): BucketData[] {
  const map = new Map<string, { expenses: number; income: number }>();

  for (const t of transactions) {
    let key: string;
    switch (timePeriod) {
      case 'daily':
        key = t.date;
        break;
      case 'weekly':
      case 'fortnightly':
        key = getWeekKey(t.date);
        break;
      case 'yearly':
        key = t.date.slice(0, 4);
        break;
      default:
        key = t.date.slice(0, 7);
        break;
    }

    const entry = map.get(key) ?? { expenses: 0, income: 0 };
    if (t.type === 'expense') {
      entry.expenses += t.amount;
    } else {
      entry.income += t.amount;
    }
    map.set(key, entry);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24)
    .map(([key, val]) => ({
      label: formatBucketLabel(key, timePeriod),
      ...val,
    }));
}

function formatBucketLabel(key: string, timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case 'daily': {
      const d = new Date(key + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    case 'weekly':
    case 'fortnightly': {
      const d = new Date(key + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    case 'yearly':
      return key;
    default: {
      const [year, month] = key.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
    }
  }
}

const PERIOD_TITLES: Record<string, string> = {
  daily: 'Daily Trends',
  weekly: 'Weekly Trends',
  fortnightly: 'Fortnightly Trends',
  monthly: 'Monthly Trends',
  yearly: 'Yearly Trends',
  all: 'Monthly Trends',
  custom: 'Trends',
};

export default function TrendChart({
  transactions,
  timePeriod,
}: TrendChartProps) {
  const formatCurrency = useFormatCurrency();
  const groupBy =
    timePeriod === 'all' || timePeriod === 'custom' ? 'monthly' : timePeriod;

  const data = useMemo(
    () => bucketTransactions(transactions, groupBy),
    [transactions, groupBy]
  );

  const title = PERIOD_TITLES[timePeriod] ?? 'Trends';

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 text-center py-8">
          No data to display
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid stroke="#2c2c2a" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#383835' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#898781', fontSize: 12 }}
            axisLine={{ stroke: '#383835' }}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '13px',
            }}
            formatter={(value, name) => [
              formatCurrency(value as number),
              name === 'income' ? 'Income' : 'Expenses',
            ]}
          />
          <Bar
            dataKey="income"
            name="income"
            fill="#199e70"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="expenses"
            name="expenses"
            fill="#d95926"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#199e70]" />
          <span className="text-xs text-gray-400">Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#d95926]" />
          <span className="text-xs text-gray-400">Expenses</span>
        </div>
      </div>
    </div>
  );
}
