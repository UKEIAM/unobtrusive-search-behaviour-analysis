import React, { Component, useState } from 'react'
import UI from '@components/UI'

function MainView() {
    const [debug, setDebug] = useState(true)

    return (
        <div id='main'>
            <div style={{ marginBottom: '', fontSize: '20px'}}>
                {' '}
                <span>
                    <h1>USBA</h1>
                    <p>Unobtrusive Search Behaviour Analysis: A study project</p>
                </span>
            </div>
            <UI debug={debug} />
        </div>
    )
}

export default MainView
