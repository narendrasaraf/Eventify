/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4f46e5', // indigo-600
                    hover: '#4338ca',
                },
                secondary: {
                    DEFAULT: '#9333ea', // purple-600
                    hover: '#7e22ce',
                },
                accent: '#06b6d4', // cyan-500
                background: '#020617', // slate-950
                surface: '#0f172a', // slate-900
                'text-primary': '#f1f5f9', // slate-100
                'text-secondary': '#94a3b8', // slate-400
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            spacing: {
                '8': '8px',
            },
            borderRadius: {
                'xl': '12px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
