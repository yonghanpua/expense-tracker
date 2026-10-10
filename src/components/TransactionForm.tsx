import { useEffect, useState } from 'react';
import type { Transaction, TransactionFormData } from '../types/transaction';
import { CATEGORIES, PAYMENT_METHODS } from '../types/transaction';
import { validateTransaction, type ValidationErrors } from '../utils/validation';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

const today = new Date().toISOString().split('T')[0];

const initialFormData: TransactionFormData = {
  date: today,
  title: '',
  category: 'Food & Dining',
  amount: '',
  type: 'expense',
  paymentMethod: 'Cash',
};

export default function TransactionForm({
  onSubmit,
  editingTransaction,
  onCancelEdit,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        date: editingTransaction.date,
        title: editingTransaction.title,
        category: editingTransaction.category,
        amount: editingTransaction.amount.toString(),
        type: editingTransaction.type,
        paymentMethod: editingTransaction.paymentMethod,
      });
      setErrors({});
    }
  }, [editingTransaction]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateTransaction(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
    setFormData(initialFormData);
    setErrors({});
  }

  function handleCancel() {
    setFormData(initialFormData);
    setErrors({});
    onCancelEdit?.();
  }

  const isEditing = !!editingTransaction;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-gray-900 p-6 border border-gray-800"
    >
      <h2 className="text-lg font-semibold text-gray-100 mb-4">
        {isEditing ? 'Edit Transaction' : 'Add Transaction'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type toggle */}
        <div className="sm:col-span-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'expense' }))}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                formData.type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'income' }))}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                formData.type === 'income'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Grocery shopping"
            className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
            Amount ($)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-red-400">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.date ? 'border-red-500' : 'border-gray-700'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-red-400">{errors.date}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-300 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
