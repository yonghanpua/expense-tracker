import type { Filters } from '../types/filters';
import { DEFAULT_FILTERS } from '../types/filters';
import { CATEGORIES } from '../types/transaction';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(patch: Partial<Filters>) {
    onChange({ ...filters, ...patch });
  }

  const hasActiveFilters =
    filters.search ||
    filters.datePreset !== 'all' ||
    filters.category !== 'all' ||
    filters.type !== 'all';

  return (
    <div className="rounded-xl bg-gray-900 p-5 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-4">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Date Preset */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Date Range
          </label>
          <select
            value={filters.datePreset}
            onChange={(e) =>
              update({
                datePreset: e.target.value as Filters['datePreset'],
                dateFrom: '',
                dateTo: '',
              })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-30">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {filters.datePreset === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => update({ dateFrom: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => update({ dateTo: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              update({ category: e.target.value as Filters['category'] })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              update({ type: e.target.value as Filters['type'] })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
    </div>
  );
}
