/*global chrome*/
import Checkbox from '@mui/material/Checkbox'
import { IconButton, Grid } from '@mui/material'
import { RiStopCircleLine } from 'react-icons/ri'
import { MdOutlineNotStarted } from 'react-icons/md'
import { BiReset } from 'react-icons/bi'
import './UI.css'
import React, { useState} from 'react'
import ResetDialog from '@components/ResetDialog'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FeedbackWidget from '@components/FeedbackWidget'



function Timer(props) {
    const { debug } = props;


    const [stopped, setStopped] = useState(false)
    const [open, setOpen] = useState(false)
    const [cancelled, setCancelled] = useState(false)
    const [searchFeedback, setSearchFeedback] = useState(false)
    const [recording, setRecording] = useState(undefined)

    const openDialog = () => {
        setOpen(true);
    }

    const closeDialog = (value) => {
        setOpen(false);
        if (value === true){
            setCancelled(true)
            setRecording(false)
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { message: "reset" })
              })
            chrome.runtime.sendMessage({ message: "reset" })
        }
    };

    const [checkbox, setCheckbox] = React.useState({
        screen: true,
        navigation: true,
        mouse: true,
      });

    const { screen, navigation, mouse } = checkbox

    const handleChange = (event) => {
        setCheckbox({
          ...checkbox,
          [event.target.name]: event.target.checked,
        });
      };

    const startRecording = () => {
        setRecording(true)
        if (screen) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { message: "start" }).then((resp) => {
                })
              })
        }

        if (navigation) {
            chrome.runtime.sendMessage({ message: "start_navigation_tracking"})
        }

        if(mouse) {
            chrome.runtime.sendMessage({ message: "start_mouse_tracking"})
        }

        console.log(...checkbox)
    }

    const stopRecording = () => {
        setRecording(false)
        chrome.runtime.sendMessage({ message: "stop_recording" });
    }

    const uploadToServer = () => {
        // TODO: Access remote folder via API and upload mediaBlobUrl
    }

    const handleFeedback = (value) => {
       setSearchFeedback = value
    }

    return (
        <div style={{ fontSize:'50px' }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <ResetDialog
                    open={open}
                    onClose={closeDialog}
                    ></ResetDialog>
                <Grid item>
                    <IconButton variant="text" style={{ marginRight: '1vh', marginBottom: '7px'}} onClick={!recording ? startRecording : stopRecording}>
                        {!recording ? (
                            <MdOutlineNotStarted
                                style={{ fontSize:'50px', color: 'red' }}
                            ></MdOutlineNotStarted>
                        ) : (
                            <RiStopCircleLine
                            style={{ fontSize:'50px' }}
                        ></RiStopCircleLine>
                        )}
                    </IconButton>
                </Grid>
                <Grid>
                    <FormGroup>
                        <FormControlLabel disabled={recording} control={<Checkbox checked={screen} onClick={handleChange} name="screen" />} label="Record screen" />
                        <FormControlLabel disabled={recording} control={<Checkbox checked={navigation} onClick={handleChange} name="navigation" />} label="Track navigation" />
                        <FormControlLabel disabled={recording} control={<Checkbox checked={mouse} onClick={handleChange} name="mouse"/>} label="Track mouse" />
                    </FormGroup>
                    </Grid>
                <Grid item>
                    {cancelled !== true ? (
                        <IconButton onClick={openDialog} style={{ marginBottom: '6vh'}}>
                            <BiReset
                                style={{ fontSize:'30px', color: 'black' }}
                            ></BiReset>
                        </IconButton>
                    ) : (
                        <IconButton disabled style={{ marginBottom: '8vh'}}>
                            <BiReset
                                style={{ fontSize:'30px'  }}
                            ></BiReset>
                        </IconButton>
                    )}
                </Grid>
            </Grid>
            {stopped && (
                <FeedbackWidget onClick={handleFeedback}/>
            )}
        </div>
    )
}

export default Timer
