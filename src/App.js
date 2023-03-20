import React, { useContext } from 'react'
import logo from './logo.svg'
import './App.css'
import Main from '@views/Main'
import { Button } from '@mui/material'
import { mainTheme } from './Themes'
import { ThemeProvider } from '@material-ui/core'

function App() {
    return (
        <div className="app">
            <ThemeProvider theme={mainTheme}>
                <Main />
            </ThemeProvider>
        </div>
    )
}

export default App
