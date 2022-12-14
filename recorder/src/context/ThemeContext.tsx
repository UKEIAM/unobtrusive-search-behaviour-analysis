import React, { createContext, useState } from 'react'

export const ThemeContext = createContext({
    isDarkTheme: false,
    toggleTheme: () => {},
})

type Props = {
    children: React.ReactNode
}

const CustomThemeProvider: React.FC<Props> = ({ children }) => {
    const [isDarkTheme, setIsDarkTheme] = useState(false)

    const toggleTheme = (): void => {
        setIsDarkTheme(!isDarkTheme)
    }

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default CustomThemeProvider
