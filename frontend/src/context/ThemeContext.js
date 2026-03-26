import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dark_mode') === 'true');

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('dark_mode', darkMode);
    }, [darkMode]);

    return (
        <ThemeContext.Provider value={{ darkMode, toggle: () => setDarkMode((d) => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
