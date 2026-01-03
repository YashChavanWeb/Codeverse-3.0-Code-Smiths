import React from 'react';

const Card = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = `
    rounded-2xl
    transition-all duration-200
    shadow-sm hover:shadow-md
  `;

  const variantStyles = {
    default: `
    bg-white
    border border-[var(--color-border)]
  `,
    glass: `
    backdrop-blur-md
    border border-[var(--color-border)]
    bg-gradient-to-br from-green-50/80 via-green-600/20 to green-50/80
  `,
    primary: `
    bg-[var(--color-primary)]
    text-[var(--color-primary-foreground)]
  `,
    subtle: `
    bg-[var(--color-background)]
    border border-[var(--color-border)]
  `,
  };


  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div
    className={`
      px-6 py-4
      border-b border-[var(--color-border)]
      font-semibold
      text-[var(--color-foreground)]
      ${className}
    `}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 text-[var(--color-foreground)] ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent };