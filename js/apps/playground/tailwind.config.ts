import type { Config } from 'tailwindcss'

const config: Config = {
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
        primary: {
          jetBlack: '#000000',
          white: '#FFFFFF',
          seaGreen: '#26a69a',
          royalBlue: '#2962ff',
          bluishDarkGray: '#131722',
          bluishDarkGrayLight: '#1e222d',
        },
        secondary: {
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
        },
        territory: {
          success: '#26a69a',
          warning: '#ff9800',
          alert: '#f23645',
          cyan: '#00bcd4',
          blue: '#2196f3',
        },
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
      borderRadius: {
        2: '8px',
      },
    },
  },
  plugins: [],
}

export default config