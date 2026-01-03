import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      variant = 'default', // default / flushed
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseInputStyles = `
      px-4 py-2 text-base font-normal transition-all duration-200
      placeholder-[var(--color-foreground-muted)] focus:outline-none
      disabled:bg-[var(--color-background-alt)] disabled:cursor-not-allowed disabled:text-[var(--color-foreground-muted)]
    `;

    const variantStyles = {
      default: `
        border border-[var(--color-border)] rounded-lg
        focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)/30] shadow-sm shadow-green-900
        ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)/30]' : ''}
      `,
      flushed: `
        border-b-2 border-[var(--color-border)] rounded-none
        focus:border-[var(--color-primary)]
        ${error ? 'border-[var(--color-error)]' : ''}
      `,
    };

    const labelStyles = 'block text-sm font-medium text-[var(--color-foreground)] mb-2';
    const errorStyles = 'mt-1 text-sm text-[var(--color-error)] font-medium';
    const helperStyles = 'mt-1 text-sm text-[var(--color-foreground-muted)]';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && <label className={labelStyles}>{label}</label>}
        <input
          ref={ref}
          className={`${baseInputStyles} ${variantStyles[variant]} ${className} ${fullWidth ? 'w-full' : ''}`}
          {...props}
        />
        {error && <p className={errorStyles}>{error}</p>}
        {helperText && !error && <p className={helperStyles}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
