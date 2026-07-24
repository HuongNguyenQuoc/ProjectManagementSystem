import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { CircleNotch } from '@phosphor-icons/react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  block = false,
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, block ? 'btn-block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <CircleNotch size={15} className="ph-spin" /> : null}
      {children}
    </button>
  );
}
