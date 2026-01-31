/**
 * Search Hook - Compatibility Layer
 * Provides the same useSearch() interface using Zustand stores
 */

'use client';

import { useSearch as useZustandSearch } from '@/stores';

/**
 * useSearch hook - provides same interface as old SearchContext
 */
export function useSearch() {
  return useZustandSearch();
}

export { useSearch as default };
