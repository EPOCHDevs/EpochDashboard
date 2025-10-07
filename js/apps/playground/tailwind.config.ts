import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './examples/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
    // Include the package components for their Tailwind classes
    '../../packages/epoch-dashboard/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens (next-themes compatible)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          // Keep backward compatibility
          jetBlack: '#000000',
          white: '#FFFFFF',
          seaGreen: '#26a69a',
          royalBlue: '#2962ff',
          bluishDarkGray: '#131722',
          bluishDarkGrayLight: '#1e222d',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          // Keep backward compatibility
          black: '#0c0e15',
          darkGray: '#161a25',
          ashGrey: '#787b86',
          mildAshGrey: '#434651',
          cementGrey: '#F7F7F7',
          mildCementGrey: '#2a2e39',
          red: '#f23645',
          mildBlack: '#080808',
          purple: '#9c27b0',
          pink: '#e91e63',
          yellow: '#ff9800',
          charcoal: '#1a1d28',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        territory: {
          success: '#26a69a',
          warning: '#ff9800',
          alert: '#f23645',
          failure: '#f23645',
          cyan: '#00bcd4',
          blue: '#2196f3',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        2: '8px',
      },
      spacing: {
        0.75: '3px',
        1.25: '5px',
        1.75: '7px',
        2.25: '9px',
        2.5: '10px',
      },
      gap: {
        0.75: '3px',
        1.25: '5px',
      },
    },
  },
  plugins: [],
}

export default config