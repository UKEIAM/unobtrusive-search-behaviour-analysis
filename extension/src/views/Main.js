import React, { Component, useState } from 'react'
import Timer from '@components/Timer'
import FeedbackWidged from '@components/FeedbackWidget'


function MainView() {
    const [active, setActive] = useState(false)
    const [searchFeedback, setSearchFeedback] = useState('n.a.')

    const [debug, setDebug] = useState(true)

    const handleClick = (value) => {
        setActive(value)
    }

    return (
        <div id='main'>
            <div style={{ marginBottom: '', fontSize: '20px'}}>
                {' '}
                <span>
                    <h1>MTB Screen Capturing</h1>
                    <p>Unobtrusive Search Behaviour Analysis</p>
                </span>
            </div>
            <Timer active={active} debug={debug} onClick={handleClick} />
            <FeedbackWidged active={active} ></FeedbackWidged>
        </div>
    )
}

export default MainView
