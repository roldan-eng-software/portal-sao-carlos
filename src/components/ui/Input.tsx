'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-1.5 block text-label-md text-on-surface">
          {label}
          {props.required && <span className="ml-1 text-badge-emergency" aria-hidden="true">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId ?? ''} ${hintId ?? ''}`.trim() || undefined}
          className={`
            w-full rounded-lg border bg-surface-card px-4 py-2.5 text-body-md text-on-surface
            placeholder:text-outline
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error focus:ring-error' : 'border-border-subtle hover:border-outline'}
            ${className}
          `}
          {...props}
        />
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

Input.displayName = 'Input';