/*global chrome*/
import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import moment from "moment";
<<<<<<< HEAD
import { Grid } from "@mui/material"
=======
>>>>>>> origin/working-prototype


async function FileProcess() {
    let rawJSON = undefined
    let initialTimeStamp = undefined
<<<<<<< HEAD
    let loading = false
    let screen = false
=======
    let screen = true
    let webVTT = 'WEBVTT\n\n';
>>>>>>> origin/working-prototype

    const processJSON = (rawJSON) => {
        let webVTTRaw = []
        let raw = []

        rawJSON.navData.forEach((row) => {
            let nestedDict = {
                timeStamp: row['timeStamp'],
                text: 'Transition : ' + row['transitionType']
            }
            raw.push(nestedDict)
        })

        rawJSON.clickData.forEach((row) =>{
            let nestedDict = {
                timeStamp: row['timeStamp'],
<<<<<<< HEAD
                text: 'Click on element: '+ row['tag'] + 'x-coordinate: ' + row['coordinates']['x'] + ' y-coordinate: ' + row['coordinates']['y']
=======
                text: 'Click on element: '+ row['tag'] + ' x-coordinate: ' + row['coordinates']['x'] + ' y-coordinate: ' + row['coordinates']['y']
>>>>>>> origin/working-prototype
            }
            raw.push(nestedDict)
        })

        raw.sort((a, b) => {
            return a.timeStamp - b.timeStamp
        })

        // deduplicate
        raw = raw.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.text === value.text && t.timeStamp === value.timeStamp
            ))
        )

        // 2. For each row in the new JSON, create the difference between the first timeStamp and all others
        // 2.1
        let init = moment(initialTimeStamp)
        const lenRaw = raw.length
        console.log(raw)
        console.log("Initial timestamp: " + init )

        for (var index = 0; index < lenRaw; index++) {
            let row = raw[index]
            let mTimeStamp = moment(row.timeStamp)
            let timeStamp = mTimeStamp.diff(init)
            let startTime = moment.utc(timeStamp).format('HH:mm:ss.SSS');
            if (startTime < 0) continue;

            const nextIndex = () => {
            if (index+1 < lenRaw) {
                return raw[index+1]["timeStamp"]
                }
            else {
                return row.timeStamp+2000
                }
            }
            console.log("Next Index: " + nextIndex())
            let nxtTimeStamp =  moment(nextIndex())
            let endTimeStamp =  nxtTimeStamp.diff(init)
            let endTime = moment.utc(endTimeStamp).format('HH:mm:ss.SSS');

            console.log(startTime);
            console.log(endTime);

            let entry = {
                start: startTime,
                end: endTime,
                text: row['text']
            }
            webVTTRaw.push(entry)
        }

            console.log("JSON Raw")
            console.log(raw)
            console.log("WebVTTRaw")
            console.log(webVTTRaw)

        webVTTRaw.forEach(caption => {
            webVTT += `${caption.start} --> ${caption.end}\n`;
            webVTT += `- ${caption.text}\n\n`;
        });

        chrome.storage.local.set({
            webVTT: webVTT
<<<<<<< HEAD
        }).then((resp) => {
            handleFiles()
        })
    }

    const handleFiles = async () => {
        // Entrypoint for file handling.
        // Either download them to local machine or connect API endpoint to tranfer to
        await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawRec"})
        })
=======
        }).then(() => {
                handleFiles()
        })
    }


    // TODO: Current use of plain "ffmpeg.js" libary destroys build due to heap limit (known bug, but not fixed)

    const handleFiles = () => {
        // Entrypoint for file handling.
        // Either download them to local machine or connect API endpoint to tranfer to
        console.log("Downloading...")
        console.log(screen)
        if(screen){
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawRec" })
            })
        }
>>>>>>> origin/working-prototype

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawData"})
        })
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadWebVTT"}).then((resp) => {
                // After downloading everything, clear storage
                chrome.storage.local.clear(() => {
                    var error = chrome.runtime.lastError;
                    if (error) {
                        console.error(error);
                    }
                });
                chrome.storage.sync.clear(); // callback is optional
            })
        })
    }

    // Load all required data asynchronously
    await chrome.storage.local.get(['initialTimeStamp']).then((resp) => {
        initialTimeStamp = resp.initialTimeStamp
    })
<<<<<<< HEAD
=======
    await chrome.storage.local.get(['userOptions']).then((resp) => {
        screen = resp.userOptions.screen
    })
>>>>>>> origin/working-prototype
    await chrome.storage.local.get(['rawJSON']).then((resp) => {
        rawJSON = resp.rawJSON
        console.log(rawJSON)
        processJSON(resp.rawJSON)
    })

    return(
        <div>
            Success
      </div>
    )
}

export default FileProcess