import { useStopwatch } from 'react-timer-hook'
import { Button } from '@mui/material'
import { RiRecordCircleLine, RiStopCircleLine } from 'react-icons/ri'
import { BiReset } from 'react-icons/bi'
import './Timer.css'
import React, { useState } from 'react'
import ResetDialog from '@mui/material'

function Timer(props) {
    const { seconds, minutes, hours, isRunning, start, pause, reset } =
        useStopwatch({
            autoStart: false,
        })
    const [dialogOpen, setDialogOpen] = useState(false)
    const [resetTimer, setResetTimer] = useState(false)

    const resteCallback = () => {}

    const checkActive = () => {
        if (props.active) {
            pause()
        } else {
            start()
        }
        props.onClick()
    }

    return (
        <div style={{ fontSize: '50px', alignItems: 'center' }}>
            <div>
                <Button onClick={checkActive} variant="text">
                    {!props.active ? (
                        <RiRecordCircleLine
                            style={{ fontSize: '50px', color: 'red' }}
                        ></RiRecordCircleLine>
                    ) : (
                        <RiStopCircleLine
                            style={{ fontSize: '50px', color: 'red' }}
                        ></RiStopCircleLine>
                    )}
                </Button>
                <span>{hours}</span>:<span>{minutes}</span>:
                <span>{seconds}</span>
            </div>
            <div>
                <Button onClick={dialogOpen}>
                    <BiReset
                        style={{ fontSize: '30px', color: 'black' }}
                    ></BiReset>
                </Button>
            </div>
        </div>
    )
}

export default Timer
