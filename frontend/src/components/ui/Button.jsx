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
      font-medium rounded-lg transition-all duration-200
      flex items-center justify-center gap-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isFullWidth ? 'w-full' : ''}
    `;

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    const variantStyles = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      ghost: 'border border-blue-600 text-blue-600',
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
