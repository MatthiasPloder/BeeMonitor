import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-2 rounded-lg transition-colors ${
        location.pathname === to
          ? 'bg-bee-yellow text-bee-brown font-semibold'
          : 'text-bee-brown hover:bg-bee-gray'
      }`}
    >
      {children}
    </Link>
  );

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-bee-brown">
            BeeMonitor
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-lg font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-bee-yellow'
                  : 'text-bee-brown hover:text-bee-yellow'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-lg font-medium transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-bee-yellow'
                      : 'text-bee-brown hover:text-bee-yellow'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/shop"
                  className={`text-lg font-medium transition-colors ${
                    location.pathname === '/shop'
                      ? 'text-bee-yellow'
                      : 'text-bee-brown hover:text-bee-yellow'
                  }`}
                >
                  Shop
                </Link>
                <Link
                  to="/profile"
                  className={`text-lg font-medium transition-colors ${
                    location.pathname === '/profile'
                      ? 'text-bee-yellow'
                      : 'text-bee-brown hover:text-bee-yellow'
                  }`}
                >
                  👤 {user?.username || 'User'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-lg font-medium text-bee-brown hover:text-bee-yellow transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-lg font-medium text-bee-brown hover:text-bee-yellow transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-bee-brown hover:bg-bee-gray rounded-lg transition-colors"
            aria-label="Menü öffnen"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-2 pt-4">
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </NavLink>
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>
                    Shop
                  </NavLink>
                  <div className="px-4 py-2 text-bee-brown border-t border-gray-200 mt-2">
                    <NavLink
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👤 {user?.username || 'User'}
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors mt-2"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </NavLink>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;

