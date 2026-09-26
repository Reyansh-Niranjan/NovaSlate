/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Neue Montreal', 'Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Frama', 'Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Frama', 'Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Neue Montreal', 'Lexend', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['Supply Mono', 'JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        // Pomelli Brand Palette (Google Labs)
        pomelli: {
          primary: '#1883B1',
          secondary: '#88A9B6',
          surface: '#DEE4E6',
          gold: '#E4B34C',
          crimson: '#D2475F',
        },
        'ns-navy':        '#1883B1',
        'ns-navy-light':  '#2197C9',
        'ns-blue':        '#1883B1',
        'ns-blue-light':  '#88A9B6',
        'ns-orange':      '#E4B34C',
        'ns-orange-light':'#F7E5B5',
        'ns-crimson':     '#D2475F',
        'ns-slate':       '#DEE4E6',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        signal: {
          emerald: 'var(--signal-emerald)',
          amber: 'var(--signal-amber)',
        },
        zinc: {
          950: '#09090b',
          900: '#18181b',
          850: '#1f1f23',
          800: '#27272a',
          700: '#3f3f46',
          600: '#52525b',
          500: '#71717a',
          400: '#a1a1aa',
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
          50: '#fafafa',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
