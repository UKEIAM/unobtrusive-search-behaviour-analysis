import React, { Component, useState } from 'react'
import Timer from '@components/Timer'
import Recorder from '@components/Recorder'
import FeedbackWidged from '@components/FeedbackWidget'


function MainView() {
    const [active, setActive] = useState(false)
    const [searchFeedback, setSearchFeedback] = useState('n.a.')

    const debug = true

    const handleClick = (value) => {
        setActive(value)
    }

    return (
        <div>
            <div style={{ marginBottom: '8vh' }}>
                {' '}
                <h1>MTB Screen Capturing</h1>
                <p>Unobtrusive Search Behaviour Analysis</p>
            </div>
            <Timer active={active} onClick={handleClick} />
            <Recorder active={active} debug={debug}></Recorder>
            <FeedbackWidged></FeedbackWidged>
        </div>
    )
}

export default MainView
