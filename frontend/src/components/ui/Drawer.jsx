import React from 'react';

export const Drawer = React.forwardRef(
  ({ open, onClose, position = 'left', width = '280px', children }, ref) => {
    React.useEffect(() => {
      document.body.style.overflow = open ? 'hidden' : 'unset';
      return () => (document.body.style.overflow = 'unset');
    }, [open]);

    return (
      <>
        <div
          className={`fixed inset-0 bg-black/50 ${open ? 'block' : 'hidden'}`}
          onClick={onClose}
        />
        <div
          ref={ref}
          className={`fixed top-0 ${position === 'left' ? 'left-0' : 'right-0'} h-full bg-white shadow-xl transition-transform ${
            open ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
          }`}
          style={{ width }}
        >
          {children}
        </div>
      </>
    );
  }
);

Drawer.displayName = 'Drawer';
