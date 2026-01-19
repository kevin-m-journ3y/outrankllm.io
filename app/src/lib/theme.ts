/**
 * Theme Configuration
 *
 * This file defines the color themes for the app.
 * To switch themes, change CURRENT_THEME and rebuild.
 *
 * The CSS variables in globals.css reference these values via data-theme attribute.
 */

export const THEMES = {
  // Original dark industrial theme
  industrial: {
    name: 'Industrial Dark',
    description: 'Original near-black theme with green accents',
    colors: {
      bg: '#0a0a0a',
      surface: '#141414',
      surfaceElevated: '#1a1a1a',
      border: '#262626',
      borderSubtle: '#1f1f1f',
      accent: '#22c55e',
      accentDim: '#16a34a',
      accentGlow: 'rgba(34, 197, 94, 0.15)',
    }
  },

  // New professional blue theme
  professional: {
    name: 'Professional Blue',
    description: 'Dark blue theme with lime accents - more professional appeal',
    colors: {
      bg: '#0c1525',
      surface: '#111c30',
      surfaceElevated: '#162340',
      border: '#1e3a5f',
      borderSubtle: '#162a4a',
      accent: '#4ade80',
      accentDim: '#22c55e',
      accentGlow: 'rgba(74, 222, 128, 0.15)',
    }
  }
} as const

/**
 * CHANGE THIS TO SWITCH THEMES
 * Options: 'industrial' | 'professional'
 */
export const CURRENT_THEME: keyof typeof THEMES = 'professional'

export type ThemeName = keyof typeof THEMES
export type Theme = typeof THEMES[ThemeName]
