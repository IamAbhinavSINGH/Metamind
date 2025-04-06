"use client"

import type React from "react";
import { createContext , useContext , useEffect , useState } from "react";

type Theme = "dark" | "light" | "system";
type ThemeProviderProps = {
    children : React.ReactNode,
    defaultTheme? : Theme,
    storageKey? : string,
    attribute?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
}
type ThemeProviderState = {
    theme : Theme,
    setTheme : (theme : Theme) => void
}

const initialState : ThemeProviderState = {
    theme : 'system',
    setTheme : () => null
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider = ({
    children ,
    defaultTheme = 'system',
    storageKey = 'ui-theme',
    attribute,
    enableSystem,
    disableTransitionOnChange,
    ...props
} : ThemeProviderProps) => {
    const [theme , setTheme] = useState<Theme>(() => {
            if (typeof window !== "undefined") {
                return (window.localStorage.getItem(storageKey) as Theme) || defaultTheme;
            }
            return defaultTheme;
        } 
    );

    useEffect(() => {
        const root = window.document.documentElement
    
        root.classList.remove("light", "dark")
    
        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    
          root.classList.add(systemTheme)
          return
        }
    
        root.classList.add(theme)
    }, [theme]);

    const value = {
        theme ,
        setTheme : (theme : Theme) => {
            if (typeof window !== "undefined") {
                window.localStorage.setItem(storageKey, theme);
            }
            setTheme(theme);
        }
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeProviderContext);