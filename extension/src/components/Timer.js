import { useStopwatch } from 'react-timer-hook'
import { IconButton, Grid } from '@mui/material'
import { RiRecordCircleLine, RiStopCircleLine } from 'react-icons/ri'
import { BiReset } from 'react-icons/bi'
import './Timer.css'
import React, { useState} from 'react'
import ResetDialog from '@components/ResetDialog'
import { useReactMediaRecorder } from "react-media-recorder";


function Timer(props) {
    const { active, debug, onClick } = props;

    const { seconds, minutes, hours, start: startTimer, pause, reset: resetTimer } =
        useStopwatch({
            autoStart: false,
        })

    const { status, startRecording: startRecord, stopRecording: stopRecord, mediaBlobUrl } =
        useReactMediaRecorder({ screen: true });

    const [open, setOpen] = useState(false);
    const [cancelled, setCancelled] = useState(false)

    const downloadRecordingPath = 'TestRecording'
    const downloadRecordingType = 'mp4'

    const [recordingNumber, setRecordingNumber] = React.useState(0);

    const openDialog = () => { 
        setOpen(true);
    }
    
    const closeDialog = (value) => {
        setOpen(false);
        if (value === true){
            resetTimer(undefined, false)
            stopRecording()
        }
    };

    const startRecording = () => {
        startRecord()
        onClick(true)
        startTimer()
    }

    const stopRecording = () => {
        
        console.log(status)
        stopRecord()
        onClick(false)
        resetTimer(undefined, false)
    }


    const downloadRecording = () => {
        const pathName = `${downloadRecordingPath}_${recordingNumber}.${downloadRecordingType}`;
        try {
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // for IE
            window.navigator.msSaveOrOpenBlob(mediaBlobUrl, pathName);
          } else {
            // for Chrome
            const link = document.createElement("a");
            link.href = mediaBlobUrl;
            link.download = pathName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (err) {
          console.error(err);
        }
      };
  
    const uploadToServer = () => {
        // TODO: Access remote folder via API and upload mediaBlobUrl
    }

    const viewRecording = () => {
        window.open(mediaBlobUrl, "_blank").focus();
    }

    React.useEffect(() =>{
        if(status === 'stopped' && active) {
            stopRecording()
            if(debug){
                downloadRecording()
            }
           
        }
    })
    return (
        <div style={{ fontSize:'50px' }}>
            <Grid container spacing={2} justifyContent= "center">
                <ResetDialog 
                    open={open}
                    onClose={closeDialog}
                    ></ResetDialog>
                <Grid item>
                    <IconButton onClick={startRecording} variant="text" style={{ marginRight: '1vh', marginBottom: '7px'}}>
                        {!active ? (
                            <RiRecordCircleLine
                                style={{ fontSize:'50px', color: 'red' }}
                            ></RiRecordCircleLine>
                        ) : (
                            <RiRecordCircleLine disabled
                            style={{ fontSize:'50px' }}
                        ></RiRecordCircleLine>
                        )}
                    </IconButton>
                        <span>{hours}</span>:<span>{minutes}</span>:
                        <span>{seconds}</span>
                </Grid>
                <Grid item>
                    {seconds !== 0 ? (
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
            
        </div>
    )
}

export default Timer
