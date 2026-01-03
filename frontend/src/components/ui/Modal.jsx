import React from 'react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'w-full sm:max-w-sm',
    md: 'w-full sm:max-w-md',
    lg: 'w-full sm:max-w-lg',
    xl: 'w-full sm:max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:py-8">
        <div
          className={`${sizeStyles[size]} bg-white rounded-lg shadow-2xl relative transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h2>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
