/*global chrome*/
import Checkbox from '@mui/material/Checkbox'
import { IconButton, Grid } from '@mui/material'
import { RiStopCircleLine } from 'react-icons/ri'
import { MdOutlineNotStarted } from 'react-icons/md'
import { BiReset } from 'react-icons/bi'
import './UI.css'
import React, { useState, useEffect } from 'react'
import ResetDialog from '@components/ResetDialog'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FeedbackWidget from '@components/FeedbackWidget'



function UI(props) {
    const { debug } = props;

    useEffect(() => {
        chrome.runtime.sendMessage({ message: "check_state" }, (response) => {
            console.log('mounted')
            const stateUpdate = Object.values(response.state)
            const record = response.recording
            console.log(stateUpdate)
            setCheckbox({...checkbox, screen: stateUpdate[0], navigation: stateUpdate[1], mouse: stateUpdate[2]})
            setState({...state, recording: record})
        })
    }, [])
    const [state, setState] = useState({
        stopped: false,
        open: false,
        cancelled: false,
        searchFeedback: false,
        recording: false,
    })
    const openDialog = () => {
        setState({...state, open: true})
    }

    const closeDialog = (value) => {
        if (value === true){
            setState({...state, cancelled: true})
            setState({...state, recording: false})
            if (screen) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { message: "reset" })
                  })
            }
            chrome.runtime.sendMessage({ message: "reset" })
        }
        setState({...state, open: false})
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
        setState({...state, recording: true})
        if (state.screen) {
            // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            //     chrome.tabs.sendMessage(tabs[0].id, { message: "start" }).then((resp) => {
            //     })
            //   })
            chrome.runtime.sendMessage({ message: "start_capture", flag: state.screen})
        }

        if (state.navigation) {
            chrome.runtime.sendMessage({ message: "start_navigation_tracking", flag: state.navigation})
        }

        if(state.mouse) {
            chrome.runtime.sendMessage({ message: "start_mouse_tracking", flag: state.mouse})
        }
    }

    const stopRecording = () => {
        setState({...state, recording: false})
        chrome.runtime.sendMessage({ message: "stop_recording"});
    }

    const uploadToServer = () => {
        // TODO: Access remote folder via API and upload mediaBlobUrl
    }

    const handleFeedback = (value) => {
        setState({...state, searchFeedback: value})
        chrome.runtime.sendMessage({ message: "finished_feedback"});
    }

    return (
        <div style={{ fontSize:'50px' }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <ResetDialog
                    open={state.open}
                    onClose={closeDialog}
                    ></ResetDialog>
                <Grid item>
                    <IconButton variant="text" style={{ marginRight: '1vh', marginBottom: '7px'}} onClick={!state.recording ? startRecording : stopRecording}>
                        {!state.recording ? (
                            <MdOutlineNotStarted
                                style={{ fontSize:'50px', color: 'red' }}
                            ></MdOutlineNotStarted>
                        ) : (
                            <RiStopCircleLine
                            style={{ fontSize:'50px', color: 'red'}}
                        ></RiStopCircleLine>
                        )}
                    </IconButton>
                </Grid>
                <Grid>
                    <FormGroup>
                        <FormControlLabel disabled={state.recording} control={<Checkbox checked={screen} onClick={handleChange} name="screen" />} label="Record screen" />
                        <FormControlLabel disabled={state.recording} control={<Checkbox checked={navigation} onClick={handleChange} name="navigation" />} label="Track navigation" />
                        <FormControlLabel disabled={state.recording} control={<Checkbox checked={mouse} onClick={handleChange} name="mouse"/>} label="Track mouse" />
                    </FormGroup>
                    </Grid>
                <Grid item>
                    {state.recording === true ? (
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
            {state.stopped && (
                <FeedbackWidget onClick={handleFeedback}/>
            )}
        </div>
    )
}

export default UI
