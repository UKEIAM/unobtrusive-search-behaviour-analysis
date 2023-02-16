/*global chrome*/
import moment from "moment";
// TODO: ffmpeg is causing build to crash -> heap size
//import ffmpeg from "ffmpeg.js/ffmpeg-worker-webm";

async function FileProcess() {
    let rawJSON = undefined
    let initialTimeStamp = undefined
    await chrome.storage.local.get(['initialTimeStamp']).then((resp) => {
        initialTimeStamp = resp.initialTimeStamp
        console.log(initialTimeStamp)
    })
    await chrome.storage.local.get(['rawJSON']).then((resp) => {
        rawJSON = resp.rawJSON
        console.log(rawJSON)
        processJSON(resp.rawJSON)
    })


    async function processJSON(rawJSON) {
        let webVTTRaw = []

        let raw = []
        rawJSON.navData.forEach((row) => {
            let nestedDict = {
                timeStamp: row['timeStamp'],
                text: row['transitionType']
            }
            raw.push(nestedDict)
        })

        rawJSON.clickData.forEach((row) =>{
            let nestedDict = {
                timeStamp: row['timeStamp'],
                text: 'Click on <' + row["tag"] + '> ' + 'x-coordinate: ' + row['coordinates']['x'] + ' y-coordinate: ' + row['coordinates']['y']
            }
            raw.push(nestedDict)
        })

        raw.sort((a, b) => {
            return b.timeStamp - a.timeStamp
        })

        // deduplicate
        raw = raw.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.text === value.text && t.timeStamp === value.timeStamp
            ))
        )
        console.log(raw)

        // 2. For each row in the new JSON, create the difference between the first timeStamp and all others
        // 2.1
        let init = moment(initialTimeStamp)
        console.log("Initial timestamp: " + init )
        raw.forEach((row, index) => {
            // TODO: Found Issue -> Click tracker not activated/ deactivated correctly. Hence clicks are recorded before the capturing started. That results in negative differences
          let mTimeStamp = moment(row.timeStamp)
          console.log("Row timestamp: " + mTimeStamp)
          let timeStamp = init.diff(mTimeStamp)
          console.log("Diff between init and mTimestamp: " + timeStamp)
          console.log("Manually caluclated diff: " + (row.timeStamp - initialTimeStamp))
          let startTime = moment.utc(timeStamp).format('HH:mm:ss.SSS');
          console.log(startTime)

          let nxtTimeStamp =  moment(raw[index]["timeStamp"])
          let endTimeStamp =  init.diff(nxtTimeStamp)
          let endTime = moment.utc(endTimeStamp).format('HH:mm:ss.SSS');

          console.log(startTime);
          console.log(endTime);

          let entry = {
            start: startTime,
            end: endTime,
            text: row['text']
          }
          webVTTRaw.push(entry)
        })

        console.log("JSON Raw")
        console.log(raw)
        console.log("WebVTTRaw")
        console.log(webVTTRaw)

        // if (screen) {
        //   await embedSubtitles(webVTTRaw).then((resp) => {
        //     handleDownload(resp.outputFilename)
        //   })}
        // else {
        //   handleDownload()
        // }
    }

    // async function embedSubtitles(webVTTRaw) {
           const recordedChunks = await chrome.storage.local.get(['recordedChunks'])
    //     const timeStamp = new Date()
    //     // EXAMPLE how it can be parsed
    //     const obj = webVTTRaw;
    //     const webvtt = 'WEBVTT\n\n';

    //     // iterate over the captions and create a WebVTT cue for each one
    //     obj.forEach(caption => {
    //         webvtt += `${caption.start} --> ${caption.end}\n`;
    //         webvtt += `${caption.text}\n\n`;
    //     });

    //     // Run FFmpeg to embed the subtitles in the video
    //     const outputFilename = `${timeStamp}_usba.mp4`;
    //     const args = [
    //         "-i", recordedChunks,
    //         "-i", "data:text/vtt;base64," + Buffer.toString(String, webvtt),
    //         "-c", "copy",
    //         outputFilename
    //     ];
    //     ffmpeg().run(...args);

    //     // Download the output file
    //     return outputFilename
    // }

    async function handleDownload(finalRecording) {
        console.log("Downloading...")
        if (finalRecording) {
        // await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        //   chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRecording", data: finalRecording})
        // }).then(() => {
        chrome.storage.local.set({
            rawJSON: [],
            recordedChunks: []
        })
        }
        console.log("DEBUG: Recording passed to download")

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawData", data: rawJSON})
        })
    }
}

export default FileProcess