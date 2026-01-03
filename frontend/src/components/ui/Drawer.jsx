// Drawer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Home as HomeIcon, User, LogOut } from 'lucide-react';

const Drawer = ({ open, onToggle }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/signin');
  };

  // Mobile overlay handling
  useEffect(() => {
    document.body.style.overflow = isMobile && open ? 'hidden' : 'unset';
    return () => (document.body.style.overflow = 'unset');
  }, [open, isMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Drawer / Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r shadow-xl flex flex-col transition-all duration-300 z-50
          ${isMobile ? 'w-64 transform ' + (open ? 'translate-x-0' : '-translate-x-full') : open ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo / Title */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`font-bold text-lg text-green-600 ${!open && !isMobile && 'hidden'}`}>
            SmartVegis
          </h1>
          <button
            onClick={() => onToggle(!open)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<HomeIcon size={20} />} label="Dashboard" open={open} />
          <NavItem
            icon={<User size={20} />}
            label="Profile"
            open={open}
            onClick={() => navigate('/profile')}
          />
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ icon, label, open, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-green-50 text-gray-700"
  >
    {icon}
    {open && <span>{label}</span>}
  </button>
);

export default Drawer;
