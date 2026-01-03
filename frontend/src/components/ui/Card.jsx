import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b font-semibold ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent };
