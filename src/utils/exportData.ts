import type { Transaction } from '../types/transaction';

export function exportToJSON(transactions: Transaction[]): string {
  return JSON.stringify(transactions, null, 2);
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = [
    'Date',
    'Title',
    'Category',
    'Amount',
    'Type',
    'Payment Method',
  ];
  const rows = transactions.map((t) => [
    t.date,
    csvEscape(t.title),
    csvEscape(t.category),
    t.amount.toFixed(2),
    t.type,
    csvEscape(t.paymentMethod),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
