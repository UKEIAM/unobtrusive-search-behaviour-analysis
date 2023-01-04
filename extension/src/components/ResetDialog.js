import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export default function ResetDialog(props) {
    const { onClose, open } = props;

  const closeDialog = (value) => {
    onClose(value);
  };

    return (
        <div>
            <Dialog
                open={open}
                onClose={closeDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Reset recording"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to reset your current recording?
                        That contains deleting all information collected?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => closeDialog(false)}>No</Button>
                    <Button onClick={() => closeDialog(true)} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
