/**
 * Toast Hook - Compatibility Layer
 * Provides the same useToast() interface using Zustand stores
 */

'use client';

import { useToast as useZustandToast } from '@/stores';

/**
 * useToast hook - provides same interface as old ToastContext
 */
export function useToast() {
  const toast = useZustandToast();

  return {
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      toast.toast(message, type);
    },
    removeToast: toast.dismiss,
    // Convenience methods
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };
}

export { useToast as default };
