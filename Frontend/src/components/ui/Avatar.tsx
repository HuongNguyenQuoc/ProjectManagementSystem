import { avatarStyle, initials } from '@/lib/format';

interface AvatarProps {
  name?: string | null;
  /** Colour is keyed off this so one person keeps one colour everywhere. */
  colorKey?: string | null;
  size?: number;
  title?: string;
}

export function Avatar({ name, colorKey, size = 26, title }: AvatarProps) {
  return (
    <span
      title={title ?? name ?? 'Unassigned'}
      style={{
        ...avatarStyle(colorKey ?? name),
        width: size,
        height: size,
        flex: 'none',
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: Math.max(9, Math.round(size * 0.36)),
        fontFamily: 'var(--font-heading)',
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      {initials(name)}
    </span>
  );
}
