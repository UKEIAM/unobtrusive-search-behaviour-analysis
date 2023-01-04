import { useStopwatch } from 'react-timer-hook'
import { IconButton, Grid } from '@mui/material'
import { RiRecordCircleLine, RiStopCircleLine } from 'react-icons/ri'
import { BiReset } from 'react-icons/bi'
import './Timer.css'
import React from 'react'
import ResetDialog from '@components/ResetDialog'

function Timer(props) {
    const { active, onClick } = props;

    const { seconds, minutes, hours, start, pause, reset } =
        useStopwatch({
            autoStart: false,
        })
    
    const [open, setOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(false);
    
    const openDialog = () => { 
        setOpen(true);
    }
    
    const closeDialog = (value) => {
        setOpen(false);
        if (value == true){
            setSelectedValue(value);
            reset(undefined, false)

            onClick(false)
        }
    };

    const setActive = () => {
        if (active) { 
            pause()
            // This is the callback function to the parent component, where "active" is defined as state
            onClick(false)
        } else {
            start() 
            onClick(true)
        }
       
    }

    return (
        <div style={{ fontSize: '50px' }}>
            <Grid container spacing={2} justifyContent= "center">
                <ResetDialog 
                    open={open}
                    onClose={closeDialog}
                    ></ResetDialog>
                <Grid item>
                    <IconButton onClick={setActive} variant="text" style={{ marginRight: '1vh', marginBottom: '7px'}}>
                        {!active ? (
                            <RiRecordCircleLine
                                style={{ fontSize: '40px', color: 'red' }}
                            ></RiRecordCircleLine>
                        ) : (
                            <RiStopCircleLine
                                style={{ fontSize: '40px', color: 'red' }}
                            ></RiStopCircleLine>
                        )}
                    </IconButton>
                        <span>{hours}</span>:<span>{minutes}</span>:
                        <span>{seconds}</span>
                </Grid>
                <Grid item>
                    {seconds != 0 ? (
                        <IconButton onClick={openDialog} style={{ marginBottom: '6vh'}}>
                            <BiReset 
                                style={{ fontSize: '30px', color: 'black' }}
                            ></BiReset>
                        </IconButton>
                    ) : (
                        <IconButton disabled style={{ marginBottom: '6vh'}}>
                            <BiReset
                                style={{ fontSize: '30px' }}
                            ></BiReset>
                        </IconButton>
                    )}
                    
                </Grid>
            </Grid>
        </div>
    )
}

export default Timer
