import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:      '#05070A',  // deepest background
        char:     '#0C1118',  // section background
        char2:    '#11171F',  // lifted section background
        gold:     '#E1A13F',  // primary accent
        'gold-pale': '#EFCFA0',
        cream:    '#FFF9F0',
        muted:    '#8D97A3',
        rule:     '#1D2632',
      },
      fontFamily: {
        // Display + wordmark. Set by next/font in layout.tsx.
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Body, labels, UI.
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { shell: '1320px' },
    },
  },
  plugins: [],
} satisfies Config;
