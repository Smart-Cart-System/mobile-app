/**
 * Colors used in the app for both light and dark modes.
 * Enhanced with a cohesive color palette for better visual design.
 */

const primaryColor = '#3B82F6'; // Blue
const primaryColorDark = '#2563EB';
const successColor = '#10B981'; // Green
const dangerColor = '#EF4444';  // Red
const warningColor = '#F59E0B'; // Amber
const infoColor = '#06B6D4';    // Cyan

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    tint: primaryColor,
    tintDarker: primaryColorDark,
    border: '#E5E7EB',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryColor,
    success: successColor,
    danger: dangerColor,
    warning: warningColor,
    info: infoColor,
    card: '#FFFFFF',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#F9FAFB',
    textSecondary: '#E5E7EB',
    textMuted: '#9CA3AF',
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    tint: '#60A5FA',
    tintDarker: '#3B82F6',
    border: '#374151',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#60A5FA',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#22D3EE',
    card: '#1F2937',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};
