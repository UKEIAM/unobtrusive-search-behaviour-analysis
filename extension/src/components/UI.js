/*global chrome*/
import Checkbox from "@mui/material/Checkbox"
import { IconButton, Grid } from "@mui/material"
import { RiStopCircleLine } from "react-icons/ri"
import { MdOutlineNotStarted } from "react-icons/md"
import { BiReset } from "react-icons/bi"
import "./UI.css"
import React, { useState, useEffect } from "react"
import ResetDialog from "@components/ResetDialog"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FeedbackWidget from "@components/FeedbackWidget"



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

    const [record, setRecording] = useState(false)

    const [userOptions, setUserOptions] = React.useState({
        screen: true,
        navigation: true,
        mouse: true,
      });

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
            setRecording(true)
            if (userOptions.screen) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { message: "start" }).then((resp) => {
                    })
                })
                chrome.runtime.sendMessage({ message: "start_capture" })
            }

            if (userOptions.navigation) {
                chrome.runtime.sendMessage({ message: "start_navigation_tracking"
                })
            }

            if(userOptions.mouse) {
                chrome.runtime.sendMessage({ message: "start_mouse_tracking"
                })
            }

            chrome.storage.local.set({
                userOptions: {
                    screen: userOptions.screen,
                    navigation: userOptions.navigation,
                    mouse: userOptions.mouse
                },
                recording: true
            })
        }

    const stopRecording = () => {
        setRecording(false)
        chrome.runtime.sendMessage({ message: "stop_recording"});
         chrome.storage.local.set({
            recording: false
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

    const handleFeedback = (value) => {
        setState({...state, searchFeedback: value})
        chrome.runtime.sendMessage({ message: "finished_feedback"});
    }

    // const updateExtesionState = () => {
    //     chrome.storage.local.set({
    //         userOptions: {
    //             screen: userOptions.mouse,
    //             navigation: userOptions.navigation,
    //             mouse: userOptions.mouse
    //         },
    //         recording: record
    //       })
    // }
    return (
        <div style={{ fontSize:"50px" }}>
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
            {state.stopped && (
                <FeedbackWidget onClick={handleFeedback}/>
            )}
        </div>
    )
}

export default UI
