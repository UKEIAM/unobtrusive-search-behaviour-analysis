/*global chrome*/
import React from 'react'
import { Snackbar, Alert, Grid, Button } from '@mui/material'
import RecSnackbar from './RecSnackbar'

function FeedbackWidged() {

    let showThanks = false

    const finishFeedback = (value) => {
        showThanks = true
        chrome.storage.sync.set({
            result: value
        })
    }
    return(
        <div>
            <Grid container spacing={2} justifyContent="center" alignItems="center">
                <h4> Was your search?</h4>
        {!showThanks ? (
            <Grid>
                <Grid item>
                    <Button variant="contained" onClick={finishFeedback(true)}>
                        Successful
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="outlined" onClick={finishFeedback(false)}>
                        Not successful
                    </Button>
                </Grid>
            </Grid>
            ) : (
            <Grid>
                <Grid item>
                    <Button variant="contained" disabled onClick={finishFeedback(true)}>
                        Successful
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="outlined" disabled onClick={finishFeedback(false)}>
                        Not successful
                    </Button>
                </Grid>
                <Grid item>
                    <RecSnackbar/>
                </Grid>
            </Grid>
            )
        }
         </Grid>
      </div>
    )
}

export default FeedbackWidged