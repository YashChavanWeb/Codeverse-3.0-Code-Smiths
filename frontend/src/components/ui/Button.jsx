import React from 'react';

export const Button = React.forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isFullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-full font-medium
      transition-all duration-200
      flex items-center justify-center gap-2
      disabled:opacity-50 disabled:cursor-not-allowed
      shadow-sm hover:shadow-md
      ${isFullWidth ? 'w-full' : ''}
    `;

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2.5',
      lg: 'px-8 py-3 text-lg',
    };

    const variantStyles = {
      primary: `
        bg-[var(--color-primary)]
        text-[var(--color-primary-foreground)]
        hover:bg-[var(--color-primary-hover)]
      `,
      secondary: `
        bg-[var(--color-secondary)]
        text-[var(--color-secondary-foreground)]
        hover:bg-[var(--color-secondary-hover)]
        border-2 border-[var(--color-border)]
      `,
      glass: `
        bg-gradient-to-br from-green-50 via-green-600/20 to green-50
        text-[var(--color-foreground)]
        border border-[var(--color-border)]
        hover:bg-white/50
      `,
      success: `
        bg-[var(--color-success)]
        text-white
        hover:brightness-110
      `,
      ghost: `
        bg-transparent
        text-[var(--color-primary)]
        border-4 border-[var(--color-border)]
        hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]
      `,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <span className="animate-spin">⏳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
