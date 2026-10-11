import { useEffect, useMemo, useRef, useState } from 'react';
import type { Filters, TimePeriod } from '../types/filters';
import { CATEGORIES } from '../types/transaction';
import { getDateRange, getPeriodOptions } from '../utils/dateRanges';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnight' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'all', label: 'All' },
  { value: 'custom', label: 'Custom' },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  function update(patch: Partial<Filters>) {
    onChange({ ...filters, ...patch });
  }

  function setPeriod(timePeriod: TimePeriod) {
    setShowDatePicker(false);
    if (timePeriod === 'custom') {
      setShowDatePicker(true);
      update({ timePeriod, offset: 0 });
    } else {
      update({ timePeriod, offset: 0, dateFrom: '', dateTo: '' });
    }
  }

  function selectOffset(offset: number) {
    update({ offset });
    setShowDatePicker(false);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasExtraFilters =
    filters.search || filters.category !== 'all' || filters.type !== 'all';

  const range = getDateRange(filters.timePeriod, filters.offset);
  const showDateSelector =
    filters.timePeriod !== 'all';

  const periodOptions = useMemo(
    () => getPeriodOptions(filters.timePeriod),
    [filters.timePeriod]
  );

  const currentLabel =
    filters.timePeriod === 'custom'
      ? filters.dateFrom || filters.dateTo
        ? `${filters.dateFrom || '...'} – ${filters.dateTo || '...'}`
        : 'Select dates'
      : filters.timePeriod === 'daily' && range
        ? range.label
        : range?.label ?? '';

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Period pills */}
        <div className="flex gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filters.timePeriod === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        {showDateSelector && (
          <div className="w-px h-5 bg-gray-700 hidden sm:block" />
        )}

        {/* Date period dropdown */}
        {showDateSelector && (
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-200 bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{currentLabel}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 text-gray-500"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                {/* Daily: show a date input */}
                {filters.timePeriod === 'daily' && (
                  <div className="p-3">
                    <label className="block text-xs text-gray-400 mb-1">
                      Pick a date
                    </label>
                    <input
                      type="date"
                      value={range?.from ?? ''}
                      onChange={(e) => {
                        const picked = e.target.value;
                        if (!picked) return;
                        const today = new Date();
                        const target = new Date(picked + 'T00:00:00');
                        const diff = Math.round(
                          (target.getTime() - today.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        selectOffset(diff);
                      }}
                      className="rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Custom: show from/to */}
                {filters.timePeriod === 'custom' && (
                  <div className="p-3 space-y-2 w-52">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => update({ dateFrom: e.target.value })}
                        className="w-full rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => update({ dateTo: e.target.value })}
                        className="w-full rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* List-based periods: weekly/fortnightly/monthly/yearly */}
                {periodOptions.length > 0 && (
                  <ul className="max-h-64 overflow-y-auto py-1 w-52">
                    {periodOptions.map((opt) => (
                      <li key={opt.offset}>
                        <button
                          onClick={() => selectOffset(opt.offset)}
                          className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                            filters.offset === opt.offset
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* More filters toggle */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              hasExtraFilters || showMore
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z"
                clipRule="evenodd"
              />
            </svg>
            Filters
            {hasExtraFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>

          {showMore && (
            <div className="absolute top-full right-0 mt-2 z-20 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl space-y-3 w-64">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => update({ search: e.target.value })}
                  placeholder="Search by title..."
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    update({
                      category: e.target.value as Filters['category'],
                    })
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    update({ type: e.target.value as Filters['type'] })
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              {hasExtraFilters && (
                <button
                  onClick={() =>
                    update({ search: '', category: 'all', type: 'all' })
                  }
                  className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors py-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
