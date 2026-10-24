import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palm: '#35251C',
        date: '#67402D',
        sand: '#D9BD91',
        ivory: '#F7F3EB',
        olive: '#626C45',
        subtleBorder: '#E7DED1',
        primary: '#35251C',
        secondary: '#67402D',
        background: '#F7F3EB',
        text: '#27231F',
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'Inter', 'sans-serif'],
        display: ['IBM Plex Sans Arabic', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        subtle: '0 4px 20px -2px rgba(53, 37, 28, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
