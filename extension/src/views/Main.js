import React, { Component, useState } from 'react'
import {
    Button,
    Input,
    TextField,
    Box,
    withTheme,
    dividerClasses,
} from '@mui/material'
import { MarginProps } from '@mui/system'
import Timer from '@components/Timer'

function MainView() {
    const [active, setActive] = useState(false)

    const handleClick = () => {
        setActive(!active)
    }

    return (
        <div>
            <div style={{ marginBottom: '10vh' }}>
                {' '}
                <h1>MTB Screen Capturing</h1>
                <p>Unobtrusive Search Behaviour Analysis</p>
            </div>

            <Timer active={active} onClick={handleClick} />
        </div>
    )
}

export default MainView
