import React from 'react'
import { Snackbar, Alert } from '@mui/material'


function FeedbackWidged(props) {
    // TODO: Short question if search was successful or not -> pre-configured answers
    const vertical = 'bottom'
    const horizontal = 'center'
    const message = 'Recording successful!'
    
    return(
        <div>
        {!props.cancelled &&(
            <Snackbar open={true} autoHideDuration={6000}
                anchorOrigin={{vertical, horizontal}}
                key={vertical + horizontal}
                message={message}>
          </Snackbar>
        )}
      </div>
    )
}

export default FeedbackWidged