/*global chrome*/
import React, { useState, useEffect } from "react"
import Checkbox from "@mui/material/Checkbox"
import { IconButton, Grid, Snackbar } from "@mui/material"
import { RiStopCircleLine } from "react-icons/ri"
import { MdOutlineNotStarted } from "react-icons/md"
import { BiReset } from "react-icons/bi"
import "./UI.css"
import ResetDialog from "@components/ResetDialog"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FeedbackWidget from "@components/FeedbackWidget"
import FileProcess from "./FileProcess"


function UI(props) {
    const { debug } = props;

    useEffect(() => {
        chrome.storage.local.get(["recording"]).then((result) => {
            setRecording(result.recording)
            console.log(result.recording)
        })
    }, [])

    useEffect(() => {
        chrome.storage.local.get(["userOptions"]).then((result) => {
            console.log(result)
            setUserOptions({...userOptions, screen: result.userOptions.screen, navigation: result.userOptions.navigation, mouse: result.userOptions.mouse})
        })
    }, [])

    useEffect(() => {
        chrome.storage.local.get(["triggerFeedback"]).then((result) => {
            console.log(result.triggerFeedback)
            setTriggerFeedback(result.triggerFeedback)
        })
    }, [])

    const [record, setRecording] = useState(false)

    const [userOptions, setUserOptions] = React.useState({
        screen: true,
        navigation: true,
        mouse: true,
      });

    const [triggerFeedback, setTriggerFeedback] = React.useState(false)

    const [state, setState] = useState({
        stopped: false,
        open: false,
        cancelled: false,
        searchFeedback: false,
    })
    const openDialog = () => {
        setState({...state, open: true})
    }

    const closeDialog = (value) => {
        if (value === true){
            setState({...state, cancelled: true})
            setRecording(false)
            setUserOptions({...userOptions, screen: true, navigation: true, mouse: true})
            if (screen) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { message: "reset" })
                  })
            }
            resetRecorder()
        }
        setState({...state, open: false})
    };

    const { screen, navigation, mouse } = userOptions

    const handleChange = (event) => {
        setUserOptions({
          ...userOptions,
          [event.target.name]: event.target.checked,
        });
      };

        const startRecording = () => {
            chrome.storage.local.set({
                recording: true,
            })
            setRecording(true)
            if (userOptions.screen) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { message: "start" }).then((resp) => {
                    })
                })
            }

            if (userOptions.navigation) {
                chrome.runtime.sendMessage({ message: "start_navigation_tracking"})
            }

            if(userOptions.mouse) {
                // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                //     chrome.tabs.sendMessage(tabs[0].id, { message: "start_click_tracking" }).then((resp) => {
                //     })
                // })

                chrome.runtime.sendMessage({ message: "start_click_tracking" })
            }

            chrome.storage.local.set({
                userOptions: {
                    screen: userOptions.screen,
                    navigation: userOptions.navigation,
                    mouse: userOptions.mouse
                },
            })
        }

    const stopRecording = () => {
        setRecording(false)
        setTriggerFeedback(true)
        chrome.runtime.sendMessage({ message: "stop_recording"});
         chrome.storage.local.set({
            recording: false,
            triggerFeedback: true
        })
        if (screen) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { message: "stop" }).then((resp) => {
                })
            })
        }
    }

    const uploadToServer = () => {
        // TODO: Access remote folder via API and upload mediaBlobUrl
    }

    // Reset recorder after triggering reset button or after successful recording and feedback
    const resetRecorder = () => {
        chrome.runtime.sendMessage({ message: "reset" })
        chrome.storage.local.set({
            userOptions: {
                screen: true,
                navigation: true,
                mouse: true,
            },
            recording: false,
          })
    }
    async function continueProcessing () {
        console.log('Processing data...')
        await chrome.runtime.sendMessage({ message: "feedback_recieved" }).then(() => {
            console.log('JSONs processed')
            // Call file preprocessor
            FileProcess()
        })
    }

    return (
        <div style={{ fontSize:"50px" }}>
            {!triggerFeedback ? (
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                <ResetDialog
                    open={state.open}
                    onClose={closeDialog}
                    ></ResetDialog>
                <Grid item>
                    <IconButton variant="text" style={{ marginRight: "1vh", marginBottom: "7px"}} onClick={!record ? startRecording : stopRecording}>
                        {!record ? (
                            <MdOutlineNotStarted
                                style={{ fontSize:"50px", color: "red" }}
                            ></MdOutlineNotStarted>
                        ) : (
                            <RiStopCircleLine
                            style={{ fontSize:"50px", color: "red"}}
                        ></RiStopCircleLine>
                        )}
                    </IconButton>
                </Grid>
                <Grid>
                    <FormGroup>
                        <FormControlLabel disabled={record} control={<Checkbox checked={screen} onClick={handleChange} name="screen" />} label="Record screen" />
                        <FormControlLabel disabled={record} control={<Checkbox checked={navigation} onClick={handleChange} name="navigation" />} label="Track navigation" />
                        <FormControlLabel disabled={record} control={<Checkbox checked={mouse} onClick={handleChange} name="mouse"/>} label="Track mouse" />
                    </FormGroup>
                    </Grid>
                <Grid item>
                    {record === true ? (
                        <IconButton onClick={openDialog} style={{ marginBottom: "6vh"}}>
                            <BiReset
                                style={{ fontSize:"30px", color: "black" }}
                            ></BiReset>
                        </IconButton>
                    ) : (
                        <IconButton disabled style={{ marginBottom: "8vh"}}>
                            <BiReset
                                style={{ fontSize:"30px"  }}
                            ></BiReset>
                        </IconButton>
                    )}
                </Grid>
            </Grid>
            ) : (
                <FeedbackWidget callBack={continueProcessing}/>
            )}
        </div>
    )
}

export default UI
