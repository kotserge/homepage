/**
 * @type {import('tailwindcss').Config}
 * */

module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Space Grotesk", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },

            colors: {
                // Emerald
                primary: "#f6f6f6",
                secondary: "#060606",
                accent: "#20EE88",
            },

            keyframes: {
                wiggle: {
                    "0%, 100%": { transform: "rotate(-3deg)" },
                    "50%": { transform: "rotate(3deg)" },
                },

                rotate: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
            },

            animation: {
                wiggle: "wiggle 1s ease-in-out infinite",
                spin: "rotate 1.5s linear infinite",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
