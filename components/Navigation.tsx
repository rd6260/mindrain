'use client';

import Link from 'next/link';
import { colors } from '@/utils/colors';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const navItems = [
  { label: 'Home', href: '/home' },
  { 
    label: 'Current Competitions', 
    href: '#',
    subItems: [
      { 
        label: 'Architecture Design', 
        href: '#',
        subSubItems: [
          { label: 'The Unreal Home', href: '/competition/imaginative-home-2025-2026' },
          // { label: 'Thesis', href: '/competition/thesis' }
        ]
      },
      { label: 'Photography', href: '/competition/photography' }
    ]
  },
  { label: 'Workshops', href: '#' },
  { label: 'Past Winners', href: '#' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '#' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled ? 'glass shadow-lg' : ''
      }`}
      style={{ 
        backgroundColor: isScrolled ? 'rgba(237, 235, 223, 0.95)' : colors.background,
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link 
            href="/home" 
            className="text-2xl font-bold tracking-tight transition-all duration-300 hover:scale-105"
            style={{ color: colors.accent }}
          >
            Mind Rain
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setActiveSubDropdown(null);
                }}
              >
                {item.subItems ? (
                  <>
                    <button
                      className="text-sm font-medium transition-all duration-300 hover:opacity-70 relative group py-2"
                      style={{ color: colors.textSecondary }}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                      <span 
                        className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: colors.accent }}
                      />
                    </button>
                    
                    {activeDropdown === item.label && (
                      <div 
                        className="absolute left-0 pt-2"
                        style={{ top: '100%' }}
                      >
                        <div 
                          className="py-2 rounded-lg shadow-lg border min-w-[200px]"
                          style={{ 
                            backgroundColor: colors.background,
                            borderColor: colors.border 
                          }}
                        >
                          {item.subItems.map((subItem) => (
                            <div 
                              key={subItem.label}
                              className="relative"
                              onMouseEnter={() => setActiveSubDropdown(subItem.label)}
                              onMouseLeave={() => setActiveSubDropdown(null)}
                            >
                              {subItem.subSubItems ? (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm transition-all duration-300 hover:bg-white/50"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    {subItem.label}
                                    <span className="float-right">›</span>
                                  </button>
                                  
                                  {activeSubDropdown === subItem.label && (
                                    <div 
                                      className="absolute top-0 pl-1"
                                      style={{ left: '100%' }}
                                    >
                                      <div 
                                        className="py-2 rounded-lg shadow-lg border min-w-[200px]"
                                        style={{ 
                                          backgroundColor: colors.background,
                                          borderColor: colors.border 
                                        }}
                                      >
                                        {subItem.subSubItems.map((subSubItem) => (
                                          <Link
                                            key={subSubItem.label}
                                            href={subSubItem.href}
                                            className="block px-4 py-2 text-sm transition-all duration-300 hover:bg-white/50"
                                            style={{ color: colors.textSecondary }}
                                          >
                                            {subSubItem.label}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <Link
                                  href={subItem.href}
                                  className="block px-4 py-2 text-sm transition-all duration-300 hover:bg-white/50"
                                  style={{ color: colors.textSecondary }}
                                >
                                  {subItem.label}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium transition-all duration-300 hover:opacity-70 relative group"
                    style={{ color: colors.textSecondary }}
                    data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.label}
                    <span 
                      className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                      style={{ backgroundColor: colors.accent }}
                    />
                  </Link>
                )}
              </div>
            ))}

            {/* Profile/Login Button */}
            {user ? (
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{ 
                  backgroundColor: colors.accent,
                  color: colors.background 
                }}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{ 
                  backgroundColor: colors.accent,
                  color: colors.background 
                }}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white/50"
            aria-label="Menu"
            data-testid="mobile-menu-button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke={colors.textPrimary}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
