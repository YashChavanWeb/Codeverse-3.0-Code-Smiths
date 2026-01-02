import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1 mb-4 ${className}`}>
            {label && (
                <label className="text-[12px] font-semibold text-foreground-muted uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                className={`px-3 py-2 rounded-lg border bg-background text-foreground text-sm transition-all focus:outline-none focus:ring-2 ${error
                        ? 'border-error focus:ring-error/20'
                        : 'border-border focus:border-border-focus focus:ring-border-focus/20'
                    }`}
                {...props}
            />
            {error && <span className="text-xs text-error font-medium">{error}</span>}
        </div>
    );
};

export { Input };

