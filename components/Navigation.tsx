'use client';

import Link from 'next/link';
import { colors } from '@/utils/colors';
import { useState } from 'react';

const navItems = [
  { label: 'Home', href: '/home' },
  { label: 'Architecture Design Competitions', href: '/competition/imaginative-home-2025-2026' },
  { label: 'Photography Competition', href: '#' },
  { label: 'Workshops', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '#' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 20);
    });
  }

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
              <Link
                key={item.label}
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
            ))}
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
