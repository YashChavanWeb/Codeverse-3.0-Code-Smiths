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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md">
        {title && (
          <div className="flex justify-between p-4 border-b">
            <h2 className="font-semibold">{title}</h2>
            {closeButton && <button onClick={onClose}>✕</button>}
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && <div className="p-4 border-t">{footer}</div>}
      </div>
    </div>
  );
};
