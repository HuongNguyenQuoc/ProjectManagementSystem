import { useId } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && !error ? (
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{hint}</span>
      ) : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {(id) => <input id={id} className="input" {...rest} />}
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextAreaField({ label, hint, error, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {(id) => <textarea id={id} className="input" {...rest} />}
    </FieldShell>
  );
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

type SelectFieldProps<T extends string> = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label: string;
  hint?: string;
  error?: string;
  options: SelectOption<T>[];
  placeholder?: string;
};

export function SelectField<T extends string>({
  label,
  hint,
  error,
  options,
  placeholder,
  ...rest
}: SelectFieldProps<T>) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {(id) => (
        <select id={id} className="input" {...rest}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}
