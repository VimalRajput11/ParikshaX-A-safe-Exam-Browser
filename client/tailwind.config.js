import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // ParikshaX brand: a deep, trustworthy navy-blue
                brand: {
                    50: '#eff5ff',
                    100: '#dbe7fe',
                    200: '#bfd4fe',
                    300: '#93b6fd',
                    400: '#608dfa',
                    500: '#3b68f6',
                    600: '#254aeb',
                    700: '#1d39d8',
                    800: '#1e30af',
                    900: '#1e2e8a',
                    950: '#171e54',
                },
            },
        },
    },
    plugins: [],
}
