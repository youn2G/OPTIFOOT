/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'matrix': '#00FF41',
                'matrix-dark': '#00CC33',
                'amber-terminal': '#FFB000',
                'terminal-bg': '#000000',
                'terminal-dark': '#0a0a0a',
                'terminal-border': '#1a1a1a',
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
            },
            animation: {
                'scanline': 'scanline 8s linear infinite',
                'blink': 'blink 1s step-end infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                blink: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 },
                },
                glow: {
                    '0%': { textShadow: '0 0 5px #00FF41, 0 0 10px #00FF41' },
                    '100%': { textShadow: '0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 30px #00FF41' },
                },
            },
        },
    },
    plugins: [],
}
