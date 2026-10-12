import { useEffect, useState } from 'react';
import type { Transaction, TransactionFormData } from '../types/transaction';
import { CATEGORIES, PAYMENT_METHODS } from '../types/transaction';
import { validateTransaction, type ValidationErrors } from '../utils/validation';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  editingTransaction?: Transaction | null;
  onClose: () => void;
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
  onClose,
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
    onClose();
  }

  function handleCancel() {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  }

  const isEditing = !!editingTransaction;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
      />
      <div className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 p-6 border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update Transaction' : 'Add Transaction'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
