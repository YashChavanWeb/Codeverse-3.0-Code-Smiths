// Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from './ui/Drawer';
import Leaderboard from './Leaderboard';
import { Home as HomeIcon, User, LogOut, Menu } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/signin');
  };

  const navItems = [
    { icon: <HomeIcon size={20} />, label: 'Dashboard', onClick: () => {} },
    { icon: <User size={20} />, label: 'Profile', onClick: () => navigate('/profile') },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Drawer */}
      <Drawer open={drawerOpen} onToggle={setDrawerOpen}>
        {/* Content inside drawer */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={`font-bold text-lg text-green-600 ${!drawerOpen && 'hidden'}`}>
              SmartVegis
            </h1>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, idx) => (
              <NavItem
                key={idx}
                icon={item.icon}
                label={item.label}
                open={drawerOpen}
                onClick={item.onClick}
              />
            ))}
          </nav>

          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
              {drawerOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content: Leaderboard */}
      <main
        className="transition-all duration-300 flex-1"
        style={{ marginLeft: drawerOpen ? 256 : 80 }} // dynamically shifts with drawer
      >
        <Leaderboard />
      </main>
    </div>
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

export default Home;
