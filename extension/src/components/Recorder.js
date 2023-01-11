import React, { watch } from "react";
import { Button } from "@mui/material"
import { useReactMediaRecorder } from "react-media-recorder";

function Recorder (props) {

    const { status, startRecording: startRecord, stopRecording: stopRecord, mediaBlobUrl } =
    useReactMediaRecorder({ screen: true });

    const downloadRecordingPath = 'TestRecording'
    const downloadRecordingType = 'mp4'

    const [recordingNumber, setRecordingNumber] = React.useState(0);
    const [recording, setRecording] = React.useState(false)



    const downloadRecording = () => {
        const pathName = `${downloadRecordingPath}_${recordingNumber}.${downloadRecordingType}`;
        try {
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            // for IE
            window.navigator.msSaveOrOpenBlob(mediaBlobUrl, pathName);
          } else {
            // for Chrome
            console.log(mediaBlobUrl)
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
      };

    return(
        <div>
            <div>
                {debug && mediaBlobUrl && status && status === 'stopped' && (
                    downloadRecording(),
         <>
                        <p>{status}</p>
                        <Button
                            size="small"
                            onClick={viewRecording}
                            type="primary"
                            icon="picture"
                            className="margin-left-sm"
                        >
                            View
                        </Button>
                        <Button 
                            size="small"
                            onClick={downloadRecording}
                            type="primary"
                            icon="picture"
                            className="margin-left-sm">
                            Download
                        </Button>
                    </>
                )}
                {status && status === 'stopped' && (
                    stopRecord(),
                    handleRecording(false),
                    handleTimerReset()
                )}
            </div>
        </div>
    )
}

export default Recorder