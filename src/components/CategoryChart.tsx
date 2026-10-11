import { useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useFormatCurrency } from '../hooks/useFormatCurrency';
import type { Category } from '../types/transaction';
import { CATEGORY_COLORS } from '../utils/chartColors';

interface CategoryChartProps {
  categoryTotals: Map<Category, number>;
}

export default function CategoryChart({ categoryTotals }: CategoryChartProps) {
  const formatCurrency = useFormatCurrency();
  const data = useMemo(() => {
    const entries: { name: string; value: number }[] = [];
    categoryTotals.forEach((value, key) => {
      if (value > 0) entries.push({ name: key, value });
    });
    return entries.sort((a, b) => b.value - a.value);
  }, [categoryTotals]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">
          Spending by Category
        </h2>
        <p className="text-sm text-gray-500 text-center py-8">
          No expense data to display
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-900 p-6 border border-gray-800">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        Spending by Category
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] ?? '#898781'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
              fontSize: '13px',
            }}
            formatter={(value) => [formatCurrency(value as number), 'Spent']}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
