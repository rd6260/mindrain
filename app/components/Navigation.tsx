'use client';

import Link from 'next/link';
import { colors } from '@/utils/colors';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import localFont from "next/font/local";

const FEARLogo = localFont({
  src: "../fonts/FEARLogo-Regular.woff2"
})


const navItems = [
  {
    label: 'Current Competitions',
    href: '#',
    subItems: [
      {
        label: 'Architecture Design',
        href: '#',
        subSubItems: [
          { label: 'The Unreal House', href: '/competition/imaginative-home-2025-2026' },
          // { label: 'Thesis', href: '/competition/thesis' }
        ],
      },
      {
        label: 'Photography',
        href: '#',
        subSubItems: [
          // { label: 'Example Photography Event', href: '/competition/photography-event' }
        ],
      },
    ],
  },
  { label: 'Workshops', href: '#' },
  { label: 'Past Winners', href: '/pastWinners' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '#' },
];

// ─────────────────────────────────────────────
// Desktop Navigation
// ─────────────────────────────────────────────
function DesktopNav({ user }: { user: User | null }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);

  return (
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
                <div className="absolute left-0 pt-2" style={{ top: '100%' }}>
                  <div
                    className="py-2 rounded-lg shadow-lg border min-w-[200px]"
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                  >
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.label}
                        className="relative"
                        onMouseEnter={() => setActiveSubDropdown(subItem.label)}
                        onMouseLeave={() => setActiveSubDropdown(null)}
                      >
                        {subItem.subSubItems !== undefined ? (
                          <>
                            <button
                              className="w-full text-left px-4 py-2 text-sm transition-all duration-300 hover:bg-white/50"
                              style={{ color: colors.textSecondary }}
                            >
                              {subItem.label}
                              <span className="float-right">›</span>
                            </button>

                            {activeSubDropdown === subItem.label && (
                              <div className="absolute top-0 pl-1" style={{ left: '100%' }}>
                                <div
                                  className="py-2 rounded-lg shadow-lg border min-w-[200px]"
                                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                                >
                                  {subItem.subSubItems.length === 0 ? (
                                    <span
                                      className="block px-4 py-2 text-sm italic opacity-50"
                                      style={{ color: colors.textSecondary }}
                                    >
                                      No active event
                                    </span>
                                  ) : (
                                    subItem.subSubItems.map((subSubItem) => (
                                      <Link
                                        key={subSubItem.label}
                                        href={subSubItem.href}
                                        className="block px-4 py-2 text-sm transition-all duration-300 hover:bg-white/50"
                                        style={{ color: colors.textSecondary }}
                                      >
                                        {subSubItem.label}
                                      </Link>
                                    ))
                                  )}
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

      {user ? (
        <Link
          href="/profile"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          Profile
        </Link>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          Login
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Mobile Bottom Sheet Navigation
// ─────────────────────────────────────────────
function MobileNav({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSubItem, setExpandedSubItem] = useState<string | null>(null);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleItem = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
    setExpandedSubItem(null);
  };

  const toggleSubItem = (label: string) => {
    setExpandedSubItem(expandedSubItem === label ? null : label);
  };

  return (
    <div className="lg:hidden flex items-center gap-2">
      {/* Auth Button */}
      {user ? (
        <Link
          href="/profile"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          Profile
        </Link>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          Login
        </Link>
      )}
      {/* Hamburger Button */}
      <button
        className="p-2 rounded-lg transition-colors hover:bg-white/50"
        aria-label="Menu"
        data-testid="mobile-menu-button"
        onClick={() => setIsOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke={colors.textPrimary} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl shadow-2xl transition-transform duration-400"
        style={{
          backgroundColor: colors.background,
          borderTop: `1px solid ${colors.border}`,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '85vh',
          overflowY: 'auto',
          // Smooth cubic-bezier for sheet animation
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Sheet Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full opacity-30"
            style={{ backgroundColor: colors.textPrimary }}
          />
        </div>

        {/* Sheet Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <Link
            href="/home"
            className={`${FEARLogo.className} text-xl tracking-tight flex items-center gap-2`}
            style={{ color: colors.accent }}
            onClick={() => setIsOpen(false)}
          >
            <img src="/logo2.svg" alt="Mind Rain logo" className="h-8" />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-white/50"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke={colors.textPrimary} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <div className="px-4 py-3 pb-10">
          {navItems.map((item) => (
            <div key={item.label} className="mb-1">
              {item.subItems ? (
                <>
                  <button
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
                    style={{ color: colors.textSecondary }}
                    onClick={() => toggleItem(item.label)}
                  >
                    <span>{item.label}</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-200"
                      style={{
                        transform: expandedItem === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedItem === item.label && (
                    <div className="ml-4 mt-1 mb-2">
                      {item.subItems.map((subItem) => (
                        <div key={subItem.label}>
                          {subItem.subSubItems !== undefined ? (
                            <>
                              <button
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/50"
                                style={{ color: colors.textSecondary }}
                                onClick={() => toggleSubItem(subItem.label)}
                              >
                                <span>{subItem.label}</span>
                                <svg
                                  className="w-4 h-4 transition-transform duration-200"
                                  style={{
                                    transform:
                                      expandedSubItem === subItem.label ? 'rotate(180deg)' : 'rotate(0deg)',
                                  }}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {expandedSubItem === subItem.label && (
                                <div className="ml-4 mt-1 mb-2">
                                  {subItem.subSubItems.length === 0 ? (
                                    <span
                                      className="block px-3 py-2 text-sm italic opacity-40"
                                      style={{ color: colors.textSecondary }}
                                    >
                                      No active event
                                    </span>
                                  ) : (
                                    subItem.subSubItems.map((subSubItem) => (
                                      <Link
                                        key={subSubItem.label}
                                        href={subSubItem.href}
                                        className="block px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/50"
                                        style={{ color: colors.textSecondary }}
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {subSubItem.label}
                                      </Link>
                                    ))
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              href={subItem.href}
                              className="block px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-white/50"
                              style={{ color: colors.textSecondary }}
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="block px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/50"
                  style={{ color: colors.textSecondary }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}

          {/* Auth Button */}
          <div className="mt-4 px-3">
            {user ? (
              <Link
                href="/profile"
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: colors.accent, color: colors.background }}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: colors.accent, color: colors.background }}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Navigation Export
// ─────────────────────────────────────────────
export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${isScrolled ? 'glass shadow-lg' : ''}`}
      style={{
        backgroundColor: isScrolled ? 'rgba(237, 235, 223, 0.95)' : colors.background,
        borderColor: colors.border,
      }}
    >
      <div className="max-w-[90%] mx-auto px-2 ">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/home"
            className={`${FEARLogo.className} text-2xl font-bold tracking-tight transition-all duration-300 hover:scale-105 flex items-center gap-2`}
            style={{ color: colors.accent }}
          >
            <img src="/logo2.svg" alt="Mind Rain logo" className="h-8" />
          </Link>

          <DesktopNav user={user} />
          <MobileNav user={user} />
        </div>
      </div>
    </nav>
  );
}
