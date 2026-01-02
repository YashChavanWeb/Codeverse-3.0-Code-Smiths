import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-background rounded-xl border border-border shadow-md overflow-hidden flex flex-col ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '' }) => (
    <div className={`p-4 border-b border-border ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-4 flex-1 ${className}`}>{children}</div>
);

const CardFooter = ({ children, className = '' }) => (
    <div className={`p-4 border-t border-border bg-background-alt ${className}`}>{children}</div>
);

export { Card, CardHeader, CardContent, CardFooter };

