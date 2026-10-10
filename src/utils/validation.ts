import type { TransactionFormData } from '../types/transaction';

export interface ValidationErrors {
  [field: string]: string;
}

export function validateTransaction(data: TransactionFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title must be under 100 characters';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  const amount = parseFloat(data.amount);
  if (!data.amount || isNaN(amount)) {
    errors.amount = 'Valid amount is required';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (amount > 999_999_999) {
    errors.amount = 'Amount is too large';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  if (!data.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }

  return errors;
}
