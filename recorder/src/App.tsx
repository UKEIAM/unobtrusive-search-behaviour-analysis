import React, { useContext } from 'react'
import logo from './logo.svg'
import './App.css'
import Interface from './components/Interface'
import { ThemeContext } from './context/ThemeContext'
import { Button } from '@mui/material'

const App: React.FC = () => {
    const { isDarkTheme, toggleTheme } = useContext(ThemeContext)
    return (
        <div className={`app ${isDarkTheme === true ? 'dark' : ''}`}>
            <button
                className={`button ${isDarkTheme === true ? 'dark' : ''}`}
                onClick={toggleTheme.bind(null)}
            >
                {isDarkTheme === true ? 'Light Theme' : 'Dark Theme'}
            </button>
            <div>
                <Interface />
            </div>
        </div>
    )
}

export default App
