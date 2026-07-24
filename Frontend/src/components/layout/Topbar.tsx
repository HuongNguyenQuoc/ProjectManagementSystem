import { useContext } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { DEFAULT_PAGE_HEADER, PageHeaderContext } from '@/context/page-header-context';

export function Topbar() {
  const context = useContext(PageHeaderContext);
  const { title, subtitle, search, actions } = context?.header ?? DEFAULT_PAGE_HEADER;

  return (
    <header
      style={{
        height: 60,
        flex: 'none',
        borderBottom: '1px solid var(--color-divider)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 26px',
        position: 'sticky',
        top: 0,
        background: 'color-mix(in srgb, var(--color-bg) 82%, transparent)',
        backdropFilter: 'blur(10px)',
        zIndex: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          className="ph-truncate"
          style={{ fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.1, maxWidth: 360 }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{subtitle}</div>
        ) : null}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        {search ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              borderRadius: 8,
              padding: '0 10px',
              height: 36,
              width: 220,
            }}
          >
            <MagnifyingGlass size={15} color="var(--color-neutral-400)" />
            <input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder ?? 'Search…'}
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--color-text)',
                font: 'inherit',
                fontSize: 13,
                outline: 'none',
                width: '100%',
                paddingLeft: 8,
              }}
            />
          </div>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
