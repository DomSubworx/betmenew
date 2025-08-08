// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // durchsucht alle deine React-Dateien im src-Ordner
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 NEW: Custom color palette from user's design
        'hookers-green': '#397367',
        'robins-egg': '#63CCCA', 
        'keppel': '#5DA399',
        'dark-cyan': '#42858C',
        'onyx': '#35393C',
        
        // 🎨 NEW: Semantic color mappings
        primary: {
          50: '#f0f9f8',
          100: '#d1f2f0',
          200: '#a3e5e1',
          300: '#75d8d2',
          400: '#47cbc3',
          500: '#397367', // Hooker's green as primary
          600: '#2e5c52',
          700: '#23413d',
          800: '#182628',
          900: '#0d0b13',
        },
        secondary: {
          50: '#f0fdfc',
          100: '#ccfbf1',
          200: '#99f6ed',
          300: '#66f0e9',
          400: '#33eae5',
          500: '#63CCCA', // Robin's egg blue as secondary
          600: '#4fa3a1',
          700: '#3b7a78',
          800: '#27514f',
          900: '#132826',
        },
        accent: {
          50: '#f0f9f8',
          100: '#d1f2f0',
          200: '#a3e5e1',
          300: '#75d8d2',
          400: '#47cbc3',
          500: '#5DA399', // Keppel as accent
          600: '#4a827a',
          700: '#37615b',
          800: '#24403c',
          900: '#111f1d',
        },
        neutral: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#35393C', // Onyx as neutral-900
        },
      },
    },
  },
  plugins: [],
}
