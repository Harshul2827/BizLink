import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import {
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
  BarChart3,
  Building2,
  Check
} from 'lucide-react';

export default function Navbar() {
  const {
    user,
    activeBusiness,
    businesses,
    setActiveBusiness,
    logout,
    isAdmin,
    isInternal,
    isAuthenticated
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronized theme toggle state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Close open dropdowns on route change
  useEffect(() => {
    setDropdownOpen(false);
    setBizDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Role-Aware Navigation Links
  // Regular business users: Feed, Discover, Network, Messaging, Projects, Dashboard
  // Internal users (Admin / Operations): additionally see Analytics and Admin Console
  const navLinks = isAuthenticated
    ? [
        { label: 'Feed', href: '/posts', icon: Layers },
        { label: 'Discover', href: '/discover', icon: Compass },
        { label: 'Network', href: '/connections', icon: Users2 },
        { label: 'Messaging', href: '/messages', icon: MessageSquare },
        { label: 'Projects', href: '/collaborations', icon: Briefcase },
        { label: 'Dashboard', href: '/dashboard', icon: Building2 },
        ...(isInternal ? [{ label: 'Analytics', href: '/analytics', icon: BarChart3 }] : []),
        ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : [])
      ]
    : [];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#111827] border-b border-border shadow-subtle transition-colors">
      <div className="enterprise-container">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded-btn">
              <Logo variant="full" size="md" />
            </Link>

            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-0.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-btn text-xs font-medium transition-colors ${
                        active
                          ? 'bg-brand-blue-tint text-brand-blue font-semibold dark:bg-[#1E293B]'
                          : 'text-text-secondary hover:text-text-primary hover:bg-secondary'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${active ? 'text-brand-blue' : 'text-text-muted'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-secondary transition-colors cursor-pointer"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Active Business Switcher Dropdown */}
                {businesses.length > 0 && (
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-btn border border-border bg-card text-xs font-medium text-text-primary hover:border-brand-blue transition-colors cursor-pointer"
                      aria-expanded={bizDropdownOpen}
                    >
                      <div className="w-4 h-4 rounded bg-[#F1F5F9] dark:bg-[#172033] flex items-center justify-center flex-shrink-0">
                        <Logo variant="mark" size={12} />
                      </div>
                      <span className="max-w-[120px] truncate text-xs">
                        {activeBusiness ? activeBusiness.name : 'Select Business'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-text-muted" />
                    </button>

                    {bizDropdownOpen && (
                      <div
                        className="absolute right-0 mt-1.5 w-64 rounded-card bg-card shadow-elevated py-1.5 z-50 border border-border"
                        onMouseLeave={() => setBizDropdownOpen(false)}
                      >
                        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted border-b border-border">
                          Active Business Profile
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          {businesses.map((biz) => {
                            const isSelected = activeBusiness?.business_id === biz.business_id;
                            return (
                              <button
                                key={biz.business_id}
                                onClick={() => {
                                  setActiveBusiness(biz);
                                  setBizDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-secondary transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'text-brand-blue font-semibold bg-brand-blue-tint dark:bg-[#1E293B]'
                                    : 'text-text-primary'
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <div className="w-4 h-4 rounded bg-[#F1F5F9] dark:bg-[#172033] flex items-center justify-center flex-shrink-0">
                                    <Logo variant="mark" size={10} />
                                  </div>
                                  <span className="truncate">{biz.name}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-brand-blue flex-shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="border-t border-border pt-1 px-1">
                          <Link
                            to="/business/create"
                            onClick={() => setBizDropdownOpen(false)}
                            className="flex items-center space-x-1.5 text-xs text-brand-blue px-2.5 py-1.5 rounded-btn hover:bg-brand-blue-tint font-medium"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Register New Business</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Avatar & Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-0.5 rounded-full hover:ring-2 hover:ring-brand-blue/30 transition-all cursor-pointer"
                    aria-label="User account menu"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold text-xs shadow-subtle">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.fullName ? user.fullName[0].toUpperCase() : 'U'
                      )}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-1.5 w-56 rounded-card bg-card shadow-elevated py-1.5 z-50 border border-border"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-2.5 border-b border-border">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">
                          {user.email}
                        </p>
                        <div className="mt-1.5">
                          <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-badge bg-brand-blue-tint text-brand-blue border border-brand-blue/20">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-3.5 py-1.5 text-xs text-text-primary hover:bg-secondary font-medium"
                        >
                          Company Dashboard
                        </Link>
                        <Link
                          to="/connections"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-3.5 py-1.5 text-xs text-text-primary hover:bg-secondary font-medium"
                        >
                          Commercial Network
                        </Link>
                      </div>

                      <div className="border-t border-border pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-3.5 py-1.5 text-xs text-red-error hover:bg-red-error-tint flex items-center space-x-1.5 font-medium cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-1.5 rounded-btn text-text-muted hover:text-text-primary hover:bg-secondary cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-btn text-xs font-medium text-text-primary hover:bg-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-btn text-xs font-semibold bg-brand-blue hover:bg-brand-blue-hover text-white shadow-subtle transition-colors"
                >
                  Join as Business
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-2 border-t border-border space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-btn text-xs font-medium ${
                    active
                      ? 'bg-brand-blue-tint text-brand-blue font-semibold dark:bg-[#1E293B]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-secondary'
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
