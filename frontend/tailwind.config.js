/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'liquid-lava': '#FD7912',
                'dark-orange': '#BC580A',
                'obsidian-blue': '#0C1422',
                'obsidian-eclipse': '#121E34',
                'obsidian-tide': '#1C3765',
                'taupe': '#646D77',
                'light-grey': '#979BA8',
                'subtle-accent': '#F8FAFC',
            },
            fontFamily: {
                'header': ['"Roboto Slab"', 'serif'],
                'body': ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 0 2px #FD7912',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }
        },
    },
    plugins: [],
}
