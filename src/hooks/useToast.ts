import { useCallback, useState } from 'react';
import type { ToastMessage, ToastType } from '../components/Toast';

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, type: ToastType = 'success') => {
    const id = String(++nextId);
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, dismiss };
}
