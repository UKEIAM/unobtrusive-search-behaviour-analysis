import React, { Component, useState } from 'react'
import Timer from '@components/UI'

function MainView() {
    const [debug, setDebug] = useState(true)

    return (
        <div id='main'>
            <div style={{ marginBottom: '', fontSize: '20px'}}>
                {' '}
                <span>
                    <h1>MTB Screen Capturing</h1>
                    <p>Unobtrusive Search Behaviour Analysis</p>
                </span>
            </div>
            <Timer debug={debug} />
        </div>
    )
}

export default MainView
