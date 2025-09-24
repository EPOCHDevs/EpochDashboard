import { DashboardTheme } from '../types/dashboard'

export const defaultTheme: DashboardTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: '#f1f5f9',
    textSecondary: 'rgba(241, 245, 249, 0.7)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem'
  }
}