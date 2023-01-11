import React from 'react'
import { Snackbar, Alert } from '@mui/material'


function FeedbackWidged(props) {
    // TODO: Short question if search was successful or not -> pre-configured answers
    const vertical = 'bottom'
    const horizontal = 'center'
    const message = 'Recording successful!'
    const [open, setSnackbarOpen] = React.useState(true)

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnackbarOpen(false);
      };

    return(
        <div>
        {!props.cancelled &&(
            <Snackbar
                open={open}
                autoHideDuration={6000}
                anchorOrigin={{vertical, horizontal}}
                key={vertical + horizontal}
                message={message}
                onClose={handleClose}>
          </Snackbar>
        )}
      </div>
    )
}

export default FeedbackWidged