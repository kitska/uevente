module.exports = {
    content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    // daisyui: {
    //   themes: ["light", "dark", "cupcake"],
    // },
    // prefix: 'tw-',
    theme: {
      extend: {
        animation: {
          'slow-pulse': 'pulse-slow 3s ease-in-out infinite',
        },
        keyframes: {
          'pulse-slow': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.9 },
          },
        },
        screens: {
          'mbl': {'max': '639px'},
          'tbl': {'max': '1023px'},
          '2tbl': {'max': '1279px'},
        },
      },
    },
    plugins: [],
  };