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
        desert: {
          gold: '#D4A574',
          dark: '#2D1810',
          light: '#F5F0E8',
          sand: '#EFE7DB',
          brown: '#5C3A21',
        },
        amber: {
          date: '#8B6F47',
        },
      },
      fontFamily: {
        sans: ['var(--font-tajawal)', 'var(--font-inter)', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
