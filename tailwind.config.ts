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
        primary: '#3E2723',
        secondary: '#D4AF37',
        background: '#FDFBF7',
        text: '#1F2937',
        desert: {
          gold: '#D4AF37',
          dark: '#3E2723',
          light: '#FDFBF7',
          sand: '#EFE7DB',
          brown: '#5C3A21',
        },
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'Tajawal', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        premium: '0 10px 40px -10px rgba(62, 39, 35, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
