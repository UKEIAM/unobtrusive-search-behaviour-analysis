import React from 'react'
import { Snackbar, Alert, Grid, Button } from '@mui/material'
import RecSnackbar from './RecSnackbar'

function FeedbackWidged(props) {
    const { callBack } = props

    const [showThanks, setShowThanks] = React.useState(false)

    const finishFeedback = (value) => {
        callBack(value)
        setShowThanks(true)
    }
    return(
        <div>
        {!showThanks ? (
            <Grid>
                <h2>Was your search?</h2>
                <Button variant="contained" onClick={finishFeedback(true)}>
                    Successful
                </Button>
                <Button variant="outlined" onClick={finishFeedback(false)}>
                    Not successful
                </Button>
            </Grid>
            ) : (
            <Grid>
                <Button variant="contained" disabled onClick={finishFeedback(true)}>
                    Successful
                </Button>
                <Button variant="outlined" disabled onClick={finishFeedback(false)}>
                    Not successful
                </Button>
                <RecSnackbar/>
            </Grid>
            )
        }
      </div>
    )
}

export default FeedbackWidged