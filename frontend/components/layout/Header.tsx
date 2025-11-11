import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userInitials = user ?
    (user.username.substring(0, 2).toUpperCase()) :
    'U';

  return (
    <header className="h-16 bg-dark-900 flex items-center justify-between px-4 sm:px-8 border-b border-dark-700">
      <h2 className="text-xl sm:text-2xl font-semibold text-white">{getTitle()}</h2>
      <div className="relative">
        {/* User Profile Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.user_type || 'trainer'}</p>
          </div>
          <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center border-2 border-brand-primary">
            <span className="text-brand-primary font-bold">{userInitials}</span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-lg z-20">
              <div className="p-3 border-b border-dark-700">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;