import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        palm: '#35251C',
        date: '#67402D',
        sand: '#D9BD91',
        ivory: '#F7F3EB',
        olive: '#626C45',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-tajawal)'],
      },
    },
  },
  plugins: [],
}
export default config