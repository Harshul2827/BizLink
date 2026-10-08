import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Compass,
  MessageSquare,
  Users2,
  Briefcase,
  Layers,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  BarChart3
} from 'lucide-react';

export default function Navbar() {
  const { user, activeBusiness, businesses, setActiveBusiness, logout, isAdmin, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navLinks = isAuthenticated ? [
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Feed', href: '/posts', icon: Layers },
    { label: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { label: 'Connections', href: '/connections', icon: Users2 },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Collaborations', href: '/collaborations', icon: Building2 },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : [])
  ] : [];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 glass border-b border-surface-200 dark:border-surface-800 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-surface-900 dark:text-white">
                Biz<span className="text-gradient">Link</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1 ml-8">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-semibold'
                          : 'text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/60 hover:text-surface-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-600 dark:text-brand-400' : 'text-surface-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Active Business Switcher Dropdown */}
                {businesses.length > 0 && (
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/80 text-xs font-medium text-surface-800 dark:text-surface-200 hover:border-brand-400 dark:hover:border-brand-500 transition-all"
                    >
                      <Building2 className="w-3.5 h-3.5 text-brand-500" />
                      <span className="max-w-[120px] truncate font-semibold">
                        {activeBusiness ? activeBusiness.name : 'Select Business'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
                    </button>

                    {bizDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 rounded-xl glass-card shadow-2xl py-2 z-50 border border-surface-200 dark:border-surface-700"
                        onMouseLeave={() => setBizDropdownOpen(false)}
                      >
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-surface-400 border-b border-surface-100 dark:border-surface-800">
                          Active Business Profile
                        </div>
                        {businesses.map((biz) => (
                          <button
                            key={biz.business_id}
                            onClick={() => {
                              setActiveBusiness(biz);
                              setBizDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors ${
                              activeBusiness?.business_id === biz.business_id
                                ? 'text-brand-600 dark:text-brand-400 font-semibold bg-brand-50/50 dark:bg-brand-950/30'
                                : 'text-surface-700 dark:text-surface-200'
                            }`}
                          >
                            <span className="truncate">{biz.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                              {biz.city || 'Profile'}
                            </span>
                          </button>
                        ))}
                        <div className="border-t border-surface-100 dark:border-surface-800 mt-1 pt-1 px-2">
                          <Link
                            to="/business/create"
                            onClick={() => setBizDropdownOpen(false)}
                            className="flex items-center space-x-1.5 text-xs text-brand-600 dark:text-brand-400 p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/50 font-medium"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create New Business</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:ring-2 hover:ring-brand-500/40 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center font-semibold text-xs shadow-md">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.fullName ? user.fullName[0].toUpperCase() : 'U'
                      )}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl glass-card shadow-2xl py-2 z-50 border border-surface-200 dark:border-surface-700"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800"
                        >
                          Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-surface-100 dark:border-surface-800 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-surface-200 dark:border-surface-800 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-semibold'
                      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
