import { useContext, useEffect } from 'react';
import {
  DEFAULT_PAGE_HEADER,
  PageHeaderContext,
  type PageHeaderState,
} from '@/context/page-header-context';

/** Call from a page to set the Topbar's title/subtitle/search for as long as it is mounted. */
export function usePageHeader(header: PageHeaderState) {
  const context = useContext(PageHeaderContext);
  if (!context) throw new Error('usePageHeader must be used inside <PageHeaderProvider>');
  const { setHeader } = context;

  const { title, subtitle, search, actions } = header;
  // Callers pass `search`/`actions` as fresh object literals every render, so
  // depending on those references directly would re-fire this effect (and
  // re-invoke setHeader) forever. Depend on primitives instead; the effect
  // closure still captures the render's actual `search`/`actions` values.
  const searchValue = search?.value;
  const searchPlaceholder = search?.placeholder;
  const searchOnChange = search?.onChange;
  const hasActions = Boolean(actions);

  useEffect(() => {
    setHeader({ title, subtitle, search, actions });
    return () => setHeader(DEFAULT_PAGE_HEADER);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search/actions intentionally tracked via primitives above
  }, [title, subtitle, searchValue, searchPlaceholder, searchOnChange, hasActions, setHeader]);
}
