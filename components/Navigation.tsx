'use client';

import Link from 'next/link';
import { colors } from '@/utils/colors';

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
  return (
    <nav 
      className="sticky top-0 z-50 border-b"
      style={{ 
        backgroundColor: colors.background,
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            href="/home" 
            className="text-xl font-semibold tracking-tight"
            style={{ color: colors.textPrimary }}
          >
            Mind Rain
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: colors.textSecondary }}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
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
