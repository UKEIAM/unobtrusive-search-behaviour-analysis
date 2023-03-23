/*global chrome*/
import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import moment from "moment";


async function FileProcess() {
    let rawJSON = undefined
    let initialTimeStamp = undefined
    let screen = true
    let webVTT = 'WEBVTT\n\n';

    const processJSON = async (rawJSON) => {
        console.log(rawJSON)
        let webVTTRaw = []
        let raw = []

        rawJSON.navData.forEach((row) => {
            let nestedDict = {
                timeStamp: row['timeStamp'],
                text: 'Transition: ' + row['transitionType']
            }
            raw.push(nestedDict)
        })

        rawJSON.clickData.forEach((row) =>{
            let nestedDict = {
                timeStamp: row['timeStamp'],
                text: row['click'] + ' , x-coordinate: ' + row['coordinates']['x'] + ' ,y-coordinate: ' + row['coordinates']['y']
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

        webVTTRaw.forEach(caption => {
            webVTT += `${caption.start} --> ${caption.end}\n`;
            webVTT += `- ${caption.text}\n\n`;
        });

        chrome.storage.local.set({
            webVTT: webVTT
        })
        const testWebVTT = await chrome.storage.local.get(['webVTT'])
        console.log(testWebVTT)
        handleFiles()
    }

    const handleFiles = async () => {
        // Entrypoint for file handling.
        // Either download them to local machine or connect API endpoint to tranfer to
        if(screen){
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawRec" })
            })
        }

        await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawData"})
        })
        await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadWebVTT"})
        })

        // TODO: Fast fix workaround. Later on, dedicated Promise in downloader.js required that returns response to chrome.tabs.sendMesasge once completed
        setTimeout(() => {
            chrome.storage.local.clear().then(
                console.log('Local storage cleared')
            )
        },5000)
    }

    // Load all required data asynchronously
    await chrome.storage.local.get(['initialTimeStamp']).then((resp) => {
        if(resp === undefined){
            console.log('ERROR: loaded initialTimeStamp undefined')
        }
        initialTimeStamp = resp.initialTimeStamp
    })
    await chrome.storage.local.get(['userOptions']).then((resp) => {
        if(resp === undefined){
            console.log('ERROR: loaded userOptions undefined')
        }
        screen = resp.userOptions.screen
    })
    await chrome.storage.local.get(['rawJSON']).then((resp) => {
        if(resp === undefined){
            console.log('ERROR: loaded rawJSON undefined')
        }
        rawJSON = resp.rawJSON
    })
    processJSON(rawJSON)

    return(
        <div>
            Success
      </div>
    )
}

export default FileProcess