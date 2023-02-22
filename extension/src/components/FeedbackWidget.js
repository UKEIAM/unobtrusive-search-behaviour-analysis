/*global chrome*/
import React from 'react'
import "./FeedbackWidget.css"
import { Snackbar, Alert, Grid, Button } from '@mui/material'
import RecSnackbar from './RecSnackbar'
import FileProcess from './FileProcess'

function FeedbackWidged(props) {

    const { callBack } = props

    const [showThanks, setShowThanks] = React.useState(false)

    const finishFeedback = (value) => {
        setShowThanks(true)
        callBack(value)
        console.log(showThanks)
        chrome.storage.local.set({
            label: value,
            triggerFeedback: false,
        })

    }
    return(
        <div>
            <Grid>
                <Grid item>
                    <h3 className='feedback_header'> The search was... </h3>
                </Grid>
        {!showThanks ? (
            <Grid  container spacing={2} justifyContent="center" alignItems="center">
                <Grid item>
                    <Button variant="contained" onClick={() => finishFeedback(true)}>
                        Successful
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={() => finishFeedback(false)}>
                        Not successful
                    </Button>
                </Grid>
            </Grid>
            ) : (
            <Grid>
                <Grid item>
                    <Button variant="contained" disabled onClick>
                        Successful
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="outlined" disabled onClick>
                        Not successful
                    </Button>
                </Grid>
                <Grid item>
                    <RecSnackbar/>
                </Grid>
            </Grid>
            )
        }
        {/* <FileProcess/> */}
         </Grid>
      </div>
    )
    // TODO add some indicator for procssing
}

export default FeedbackWidged