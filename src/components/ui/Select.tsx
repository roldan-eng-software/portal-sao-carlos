'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${selectId}-error` : undefined;
    const hintId = hint ? `${selectId}-hint` : undefined;

    return (
      <div className="w-full">
        <label htmlFor={selectId} className="mb-1.5 block text-label-md text-on-surface">
          {label}
          {props.required && <span className="ml-1 text-badge-emergency" aria-hidden="true">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId ?? ''} ${hintId ?? ''}`.trim() || undefined}
          className={`
            w-full rounded-lg border bg-surface-card px-4 py-2.5 text-body-md text-on-surface
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error' : 'border-border-subtle hover:border-outline'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} className="mt-1.5 text-body-sm text-error" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-body-sm text-outline">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';