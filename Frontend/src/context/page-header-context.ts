import { createContext } from 'react';
import type { ReactNode } from 'react';

export interface PageHeaderSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface PageHeaderState {
  title: string;
  subtitle?: string;
  search?: PageHeaderSearch;
  actions?: ReactNode;
}

export interface PageHeaderContextValue {
  header: PageHeaderState;
  setHeader: (header: PageHeaderState) => void;
}

export const DEFAULT_PAGE_HEADER: PageHeaderState = { title: '' };

export const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);
