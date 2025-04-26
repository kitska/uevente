module.exports = {
    content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                'slow-pulse': 'pulse-slow 3s ease-in-out infinite',
                'gradientBlur': 'gradientBlur 8s ease infinite', // ✨ added
            },
            keyframes: {
                'pulse-slow': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.9 },
                },
                gradientBlur: { // ✨ added
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backgroundSize: { // ✨ added
                'gradient': '200% 200%',
            },
            screens: {
                'mbl': { 'max': '639px' },
                'tbl': { 'max': '1023px' },
                '2tbl': { 'max': '1279px' },
            },
        },
    },
    plugins: [],
};
