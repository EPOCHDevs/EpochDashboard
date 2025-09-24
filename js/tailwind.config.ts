import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          jetBlack: '#000000',
          white: '#FFFFFF',
          seaGreen: '#19B0B1',
          royalBlue: '#0951A6',
          bluishDarkGray: '#0E121F',
          bluishDarkGrayLight: '#181F33',
        },
        secondary: {
          black: '#090A0B',
          darkGray: '#0A0D17',
          ashGrey: '#757575',
          mildAshGrey: '#3E414C',
          cementGrey: '#F7F7F7',
          mildCementGrey: '#191C25',
          red: '#F63C6B',
          mildBlack: '#080808',
          purple: '#6E00FE',
          pink: '#FA73FF',
          yellow: '#FFE500',
        },
        territory: {
          success: '#00FE2A',
          warning: '#FE8C00',
          alert: '#FF0004',
          cyan: '#00E9FE',
          blue: '#0D69A9',
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