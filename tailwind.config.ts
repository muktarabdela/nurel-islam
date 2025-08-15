// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class", // use class-based dark mode
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                primary: "var(--color-primary)",
                // add more if you want shortcut Tailwind utility support
            },
        },
    },
    plugins: [],
};

export default config;
