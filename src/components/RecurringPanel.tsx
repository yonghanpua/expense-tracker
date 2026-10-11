import { useState } from 'react';
import type { Frequency, RecurringRule } from '../types/recurring';
import { FREQUENCIES } from '../types/recurring';
import type { Category, PaymentMethod } from '../types/transaction';
import { CATEGORIES, PAYMENT_METHODS } from '../types/transaction';
import { formatCurrency } from '../utils/format';

interface RecurringPanelProps {
  rules: RecurringRule[];
  onAdd: (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

const today = new Date().toISOString().split('T')[0];

interface FormState {
  title: string;
  amount: string;
  category: Category;
  type: 'income' | 'expense';
  paymentMethod: PaymentMethod;
  frequency: Frequency;
  nextDate: string;
  endDate: string;
}

const initialForm: FormState = {
  title: '',
  amount: '',
  category: 'Salary',
  type: 'income',
  paymentMethod: 'Bank Transfer',
  frequency: 'monthly',
  nextDate: today,
  endDate: '',
};

export default function RecurringPanel({
  rules,
  onAdd,
  onRemove,
  onToggle,
}: RecurringPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || isNaN(amount) || amount <= 0 || !form.nextDate)
      return;

    onAdd({
      title: form.title.trim(),
      amount,
      category: form.category,
      type: form.type,
      paymentMethod: form.paymentMethod,
      frequency: form.frequency,
      nextDate: form.nextDate,
      endDate: form.endDate,
      enabled: true,
    });
    setForm(initialForm);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      onRemove(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">
            Recurring Transactions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-generated on schedule when you open the app
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Rule'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 border-b border-gray-800 space-y-4"
        >
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: 'expense' }))}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                form.type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, type: 'income' }))}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                form.type === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g., Monthly Salary"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    frequency: e.target.value as Frequency,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    category: e.target.value as Category,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Payment Method
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentMethod: e.target.value as PaymentMethod,
                  }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.nextDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nextDate: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                End Date
                <span className="text-gray-500 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.nextDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Add Recurring Rule
          </button>
        </form>
      )}

      {rules.length === 0 && !showForm && (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">
            No recurring transactions set up yet
          </p>
        </div>
      )}

      {rules.length > 0 && (
        <ul className="divide-y divide-gray-800">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
            >
              <button
                onClick={() => onToggle(rule.id)}
                className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                  rule.enabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                title={rule.enabled ? 'Disable' : 'Enable'}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>

              <div
                className={`flex-1 min-w-0 ${!rule.enabled ? 'opacity-50' : ''}`}
              >
                <p className="text-sm font-medium text-gray-100 truncate">
                  {rule.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {FREQUENCIES.find((f) => f.value === rule.frequency)?.label}{' '}
                  &middot; {rule.category} &middot; Next:{' '}
                  {new Date(rule.nextDate + 'T00:00:00').toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  )}
                  {rule.endDate && (
                    <>
                      {' '}
                      &middot; Ends:{' '}
                      {new Date(
                        rule.endDate + 'T00:00:00'
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </p>
              </div>

              <span
                className={`text-sm font-semibold whitespace-nowrap ${
                  rule.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                } ${!rule.enabled ? 'opacity-50' : ''}`}
              >
                {rule.type === 'income' ? '+' : '-'}
                {formatCurrency(rule.amount)}
              </span>

              <button
                onClick={() => handleDelete(rule.id)}
                onBlur={() => setConfirmDeleteId(null)}
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                  confirmDeleteId === rule.id
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-gray-500 hover:text-red-400 hover:bg-red-900/30'
                }`}
                title={
                  confirmDeleteId === rule.id
                    ? 'Click again to confirm'
                    : 'Delete'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
