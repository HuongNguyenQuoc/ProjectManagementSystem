import { useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_PAGE_HEADER,
  PageHeaderContext,
  type PageHeaderContextValue,
  type PageHeaderState,
} from '@/context/page-header-context';

/** Lets each page own the Topbar's title/subtitle/search without prop-drilling through the router outlet. */
export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<PageHeaderState>(DEFAULT_PAGE_HEADER);
  const value = useMemo<PageHeaderContextValue>(() => ({ header, setHeader }), [header]);
  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}
