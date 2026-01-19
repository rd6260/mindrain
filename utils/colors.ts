// Centralized color management for Mind Rain website

export const colors = {
  // Primary colors
  background: '#EDEBDF',
  accent: '#2C5F5F',
  accentHover: '#1A4D4D',
  
  // Text colors
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textLight: '#8B8B8B',
  textWhite: '#FFFFFF',
  
  // UI colors
  white: '#FFFFFF',
  border: '#D0CEC2',
  borderLight: '#E5E3D7',
  cardBackground: '#F8F7F2',
  
  // Status colors
  success: '#2D5F4F',
  warning: '#D97757',
  error: '#C85D3E',
} as const;

export type ColorKey = keyof typeof colors;
