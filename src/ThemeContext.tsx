// ThemeContext.tsx

import React, { createContext, useContext } from 'react';
import { DarkTheme } from './styles/themes';

type Theme = typeof DarkTheme;

const ThemeContext = createContext<Theme>(DarkTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <ThemeContext.Provider value={DarkTheme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
