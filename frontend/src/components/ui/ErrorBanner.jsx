import React from 'react';

const ErrorBanner = ({ message, onClose, className = '' }) => {
    if (!message) return null;

    return (
        <div
            className={`flex items-center justify-between p-4 mb-4 rounded-lg bg-error/5 border border-error/20 text-error shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
            role="alert"
        >
            <div className="flex items-center gap-3">
                <svg
                    className="w-5 h-5flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-sm font-semibold">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-1 rounded-md hover:bg-error/10 transition-colors focus:outline-none focus:ring-2 focus:ring-error/20"
                    aria-label="Close error message"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
};

export { ErrorBanner };
