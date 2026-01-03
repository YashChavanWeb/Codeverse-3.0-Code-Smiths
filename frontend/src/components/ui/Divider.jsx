import React from 'react';

export const Divider = ({ orientation = 'horizontal', className = '' }) => {
  return (
    <div
      className={`${orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px'} bg-gray-200 ${className}`}
    />
  );
};
