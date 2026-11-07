module.exports = {
  content: ['./tracker.html', './tracker.js'],
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50:  '#f0fdfa',
              100: '#ccfbf1',
              300: '#5eead4',
              500: '#14b8a6',
              600: '#0d9488',
              700: '#0f766e',
            },
            accent: {
              500: '#f43f5e', // vibrant coral
              600: '#e11d48',
            },
            sun: {
              500: '#f59e0b', // vibrant amber
            },
            iris: {
              500: '#8b5cf6', // vibrant violet
            },
          },
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui'],
          },
          boxShadow: {
            glow: '0 10px 40px -10px rgba(20,184,166,0.45)',
          },
          keyframes: {
            floaty: {
              '0%,100%': { transform: 'translateY(0px)' },
              '50%':     { transform: 'translateY(-10px)' },
            },
            pulseRing: {
              '0%':   { transform: 'scale(0.9)', opacity: '0.7' },
              '100%': { transform: 'scale(1.6)', opacity: '0' },
            },
          },
          animation: {
            floaty: 'floaty 4s ease-in-out infinite',
            pulseRing: 'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
          },
        },
      },
};
