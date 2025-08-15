// lib/telegram.ts
declare global {
    interface Window {
        // @ts-ignore
        Telegram: {
            WebApp: ITelegramWebApp;
        };
    }
}

const USE_DUMMY_DATA = process.env.NEXT_PUBLIC_USE_DUMMY_TELEGRAM === 'true';

interface ITelegramWebApp {
    ready: () => void;
    expand: () => void;
    initDataUnsafe: {
        user?: {
            id: number; // Telegram User ID
            first_name: string;
            username?: string;
            photo_url?: string;
        };
    };
}

// Dummy Telegram user data for development
const DUMMY_USER = {
    id: 87654321,
    first_name: "Test",
    username: "test_user",
    photo_url: "https://via.placeholder.com/150",
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'development_hash'
};

/**
 * Loads the Telegram WebApp script dynamically or uses dummy data in development.
 * @returns A promise that resolves when the script is loaded or dummy data is ready.
 */
export function loadTelegramWebApp(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("Cannot load Telegram WebApp outside of browser."));
            return;
        }

        // In development, use dummy data if not in Telegram WebView
        if (USE_DUMMY_DATA && !window.Telegram?.WebApp) {
            console.warn('Development mode: Using dummy Telegram user data');
            window.Telegram = window.Telegram || {
                WebApp: {
                    ready: () => console.log('Dummy Telegram WebApp ready'),
                    expand: () => console.log('Dummy Telegram WebApp expand called'),
                    initDataUnsafe: { user: DUMMY_USER }
                }
            };
            resolve();
            return;
        }

        // Check if already loaded
        if (window.Telegram?.WebApp) {
            resolve();
            return;
        }

        // Rest of the original loading logic
        const existingScript = document.getElementById("telegram-webapp-script");
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve());
            if (window.Telegram?.WebApp) resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-web-app.js";
        script.async = true;
        script.id = "telegram-webapp-script";
        script.onload = () => {
            console.log("Telegram WebApp script loaded.");
            resolve();
        };
        script.onerror = (error) => {
            console.error("Failed to load Telegram WebApp script:", error);
            reject(new Error("Failed to load Telegram WebApp script."));
        };

        document.head.appendChild(script);
    });
}
/**
 * Gets the current Telegram user data.
 * In development, returns dummy data when not in Telegram WebView.
 * @returns The user data object or null if not available.
 */
export function getTelegramUser() {
    if (USE_DUMMY_DATA && (!window.Telegram?.WebApp || !window.Telegram.WebApp.initDataUnsafe?.user)) {
        console.warn('Development mode: Returning dummy Telegram user');
        return DUMMY_USER;
    }

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        return window.Telegram.WebApp.initDataUnsafe?.user || null;
    }
    return null;
}

/**
 * Signals to Telegram that the WebApp is ready.
 * In development, logs to console when not in Telegram WebView.
 */
export function expandTelegramWebApp() {
    if (USE_DUMMY_DATA && !window.Telegram?.WebApp) {
        console.log('Dummy Telegram WebApp expand called');
        return;
    }

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        // @ts-ignore
        window.Telegram.WebApp.ready();
        // window.Telegram.WebApp.expand(); // Uncomment if you want to expand in production
    }
}
