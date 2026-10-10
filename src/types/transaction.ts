export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Savings & Investments',
  'Salary',
  'Freelance',
  'Other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  title: string;
  category: Category;
  amount: number; // always positive; type determines sign
  type: TransactionType;
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO timestamp
}

export interface TransactionFormData {
  date: string;
  title: string;
  category: Category;
  amount: string; // string for form input handling
  type: TransactionType;
  paymentMethod: PaymentMethod;
}
