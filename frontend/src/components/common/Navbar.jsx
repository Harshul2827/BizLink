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
    { label: 'Feed', href: '/posts', icon: Layers },
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'Network', href: '/connections', icon: Users2 },
    { label: 'Messaging', href: '/messages', icon: MessageSquare },
    { label: 'Projects', href: '/collaborations', icon: Building2 },
    { label: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: ShieldCheck }] : [])
  ] : [];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-[#FFFFFF] dark:bg-[#131C2E] border-b border-[#D9E2EC] dark:border-[#22314A] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white shadow-sm group-hover:bg-[#004182] transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1D2226] dark:text-white">
                Biz<span className="text-[#0A66C2] dark:text-[#388FE5]">Link</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1 ml-6">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-[#EEF6FC] text-[#0A66C2] dark:bg-[#1E2E48] dark:text-[#388FE5]'
                          : 'text-[#5E6C76] dark:text-[#94A3B8] hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] hover:text-[#1D2226] dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#0A66C2] dark:text-[#388FE5]' : 'text-[#5E6C76] dark:text-[#94A3B8]'}`} />
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
              className="p-2 rounded-lg text-[#5E6C76] hover:text-[#1D2226] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] transition-colors"
              title="Toggle theme"
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
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-[#D9E2EC] dark:border-[#22314A] bg-[#FFFFFF] dark:bg-[#1A263D] text-xs font-semibold text-[#1D2226] dark:text-white hover:border-[#0A66C2] transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#0A66C2]" />
                      <span className="max-w-[130px] truncate">
                        {activeBusiness ? activeBusiness.name : 'Select Business'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#5E6C76]" />
                    </button>

                    {bizDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-60 rounded-xl bg-[#FFFFFF] dark:bg-[#131C2E] shadow-lg py-2 z-50 border border-[#D9E2EC] dark:border-[#22314A]"
                        onMouseLeave={() => setBizDropdownOpen(false)}
                      >
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5E6C76] dark:text-[#94A3B8] border-b border-[#D9E2EC] dark:border-[#22314A]">
                          Active Business Profile
                        </div>
                        {businesses.map((biz) => (
                          <button
                            key={biz.business_id}
                            onClick={() => {
                              setActiveBusiness(biz);
                              setBizDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] transition-colors ${
                              activeBusiness?.business_id === biz.business_id
                                ? 'text-[#0A66C2] dark:text-[#388FE5] font-bold bg-[#EEF6FC] dark:bg-[#1E2E48]'
                                : 'text-[#1D2226] dark:text-white'
                            }`}
                          >
                            <span className="truncate">{biz.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9EFF5] dark:bg-[#22314A] text-[#5E6C76] dark:text-[#94A3B8]">
                              {biz.city || 'Profile'}
                            </span>
                          </button>
                        ))}
                        <div className="border-t border-[#D9E2EC] dark:border-[#22314A] mt-1 pt-1 px-2">
                          <Link
                            to="/business/create"
                            onClick={() => setBizDropdownOpen(false)}
                            className="flex items-center space-x-1.5 text-xs text-[#0A66C2] dark:text-[#388FE5] p-1.5 rounded-lg hover:bg-[#EEF6FC] dark:hover:bg-[#1E2E48] font-semibold"
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
                    className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-[#0A66C2]/30 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.fullName ? user.fullName[0].toUpperCase() : 'U'
                      )}
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[#FFFFFF] dark:bg-[#131C2E] shadow-xl py-2 z-50 border border-[#D9E2EC] dark:border-[#22314A]"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-[#D9E2EC] dark:border-[#22314A]">
                        <p className="text-xs font-bold text-[#1D2226] dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-[#5E6C76] dark:text-[#94A3B8] truncate">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EEF6FC] text-[#0A66C2] dark:bg-[#1E2E48] dark:text-[#388FE5]">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-[#1D2226] dark:text-[#F1F5F9] hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] font-medium"
                        >
                          My Dashboard
                        </Link>
                        <Link
                          to="/connections"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-xs text-[#1D2226] dark:text-[#F1F5F9] hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D] font-medium"
                        >
                          Commercial Network
                        </Link>
                      </div>

                      <div className="border-t border-[#D9E2EC] dark:border-[#22314A] pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 font-semibold"
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
                  className="lg:hidden p-2 rounded-lg text-[#5E6C76] dark:text-[#94A3B8] hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D]"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#0A66C2] hover:bg-[#EEF6FC] dark:hover:bg-[#1E2E48] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#D9E2EC] dark:border-[#22314A] space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                    active
                      ? 'bg-[#EEF6FC] text-[#0A66C2] dark:bg-[#1E2E48] dark:text-[#388FE5]'
                      : 'text-[#5E6C76] dark:text-[#94A3B8] hover:bg-[#F3F6F8] dark:hover:bg-[#1A263D]'
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
