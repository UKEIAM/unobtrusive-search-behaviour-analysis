import React from 'react'
import { Snackbar, Alert, Grid, Button } from '@mui/material'


function FeedbackWidged(props) {
    const {cancelled, callBack} = props
    // TODO: Short question if search was successful or not -> pre-configured answers
    const vertical = 'bottom'
    const horizontal = 'center'
    const message = 'Thank you!'
    const [showThanks, setShowThanks] = React.useState(false)

    const finishFeedback = (value) => {
        callBack(value)
        setShowThanks(true)
    }
    return(
        <div>
        {!cancelled & !showThanks ? (
            <Grid>
                <h2>Whas your search?</h2>
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
            </Grid>
        )
        }

      </div>
    )
}

export default FeedbackWidged