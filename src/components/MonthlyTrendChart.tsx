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
import type { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/format';

interface MonthlyTrendChartProps {
  transactions: Transaction[];
}

interface MonthData {
  month: string;
  expenses: number;
  income: number;
}

export default function MonthlyTrendChart({
  transactions,
}: MonthlyTrendChartProps) {
  const data = useMemo(() => {
    const monthMap = new Map<string, { expenses: number; income: number }>();

    for (const t of transactions) {
      const key = t.date.slice(0, 7);
      const entry = monthMap.get(key) ?? { expenses: 0, income: 0 };
      if (t.type === 'expense') {
        entry.expenses += t.amount;
      } else {
        entry.income += t.amount;
      }
      monthMap.set(key, entry);
    }

    const sorted: MonthData[] = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, val]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          }),
          ...val,
        };
      });

    return sorted;
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">
          Monthly Trends
        </h2>
        <p className="text-sm text-gray-500 text-center py-8">
          No data to display
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        Monthly Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid
            strokeDasharray=""
            stroke="#2c2c2a"
            vertical={false}
          />
          <XAxis
            dataKey="month"
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
            name="Income"
            fill="#199e70"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="expenses"
            name="Expenses"
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
