import React from 'react';

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      as = 'input',
      options = [],
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && <label className="block mb-1 text-sm">{label}</label>}
        {as === 'select' ? (
          <select ref={ref} className={`border p-2 rounded ${className}`} {...props}>
            {options.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <input ref={ref} className={`border p-2 rounded ${className}`} {...props} />
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {helperText && !error && <p className="text-gray-500 text-sm">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
