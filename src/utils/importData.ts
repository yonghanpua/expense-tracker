import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../types/transaction';
import { CATEGORIES, PAYMENT_METHODS } from '../types/transaction';

export interface ImportResult {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
}

export function importJSON(content: string): ImportResult {
  const errors: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { transactions: [], errors: ['Invalid JSON file'], skipped: 0 };
  }

  if (!Array.isArray(parsed)) {
    return {
      transactions: [],
      errors: ['JSON must contain an array of transactions'],
      skipped: 0,
    };
  }

  const transactions: Transaction[] = [];
  let skipped = 0;

  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i];
    const result = validateRow(row, i + 1);
    if (result.error) {
      errors.push(result.error);
      skipped++;
    } else {
      transactions.push(result.transaction!);
    }
  }

  return { transactions, errors, skipped };
}

export function importCSV(content: string): ImportResult {
  const errors: string[] = [];
  const lines = content.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return {
      transactions: [],
      errors: ['CSV file must have a header row and at least one data row'],
      skipped: 0,
    };
  }

  const transactions: Transaction[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 6) {
      errors.push(`Row ${i}: not enough columns (expected 6, got ${cols.length})`);
      skipped++;
      continue;
    }

    const [date, title, category, amountStr, type, paymentMethod] = cols;
    const row = { date, title, category, amount: amountStr, type, paymentMethod };
    const result = validateRow(row, i);
    if (result.error) {
      errors.push(result.error);
      skipped++;
    } else {
      transactions.push(result.transaction!);
    }
  }

  return { transactions, errors, skipped };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

function validateRow(
  row: Record<string, unknown>,
  rowNum: number
): { transaction?: Transaction; error?: string } {
  const date = String(row.date ?? '').trim();
  const title = String(row.title ?? '').trim();
  const category = String(row.category ?? '').trim();
  const type = String(row.type ?? '').trim();
  const paymentMethod = String(row.paymentMethod ?? '').trim();
  const amount = parseFloat(String(row.amount ?? ''));

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: `Row ${rowNum}: invalid date "${date}" (expected YYYY-MM-DD)` };
  }
  if (!title) {
    return { error: `Row ${rowNum}: missing title` };
  }
  if (isNaN(amount) || amount <= 0) {
    return { error: `Row ${rowNum}: invalid amount` };
  }
  if (type !== 'income' && type !== 'expense') {
    return { error: `Row ${rowNum}: type must be "income" or "expense"` };
  }

  const matchedCategory = CATEGORIES.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
  const matchedPayment = PAYMENT_METHODS.find(
    (p) => p.toLowerCase() === paymentMethod.toLowerCase()
  );

  return {
    transaction: {
      id: (row as Record<string, unknown>).id
        ? String((row as Record<string, unknown>).id)
        : uuidv4(),
      date,
      title,
      category: matchedCategory ?? 'Other',
      amount,
      type: type as 'income' | 'expense',
      paymentMethod: matchedPayment ?? 'Cash',
      createdAt:
        ((row as Record<string, unknown>).createdAt as string) ??
        new Date().toISOString(),
    },
  };
}
