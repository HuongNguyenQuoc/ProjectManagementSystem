import { useId } from 'react';
import type { ReactNode } from 'react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/** The Nocturne `.seg` control — a radio group styled as connected pills. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  style,
}: SegmentedProps<T>) {
  const name = useId();
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel} style={style}>
      {options.map((option) => (
        <label key={option.value} className="seg-opt">
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.icon}
          {option.label}
        </label>
      ))}
    </div>
  );
}
