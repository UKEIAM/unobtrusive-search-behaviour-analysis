/*global chrome*/
import moment from "moment";
// TODO: ffmpeg is causing build to crash -> heap size
//import ffmpeg from "ffmpeg.js/ffmpeg-worker-webm";

function FileProcess() {
    let rawJSON = []
    chrome.storage.local.get('rawJSON').then((resp) => {
        rawJSON = resp.rawJSON
        console.log(rawJSON)
        processJSON(rawJSON)
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
                text: 'Click: ' + row['coordinates'] + ' '
            }
            raw.push(nestedDict)
        })

        // 2. For each row in the new JSON, create the difference between the first timeStamp and all others
        // 2.1
        raw.forEach((row) => {

          const timestamp = row["timestamp"];
          const timeValue = moment.duration(timestamp).asMilliseconds();
          const startTimeStamp = moment.utc(timeValue).format('HH:mm:ss.SSS');

          const date = new Date(Date.parse(`1970-01-01T${startTimeStamp}Z`));
          date.setSeconds(date.getSeconds() + 2);

          const endTimeStamp = date.toISOString().substring(11, 12);
          console.log(startTimeStamp);
          console.log(endTimeStamp);

          const entry = {
            start: startTimeStamp,
            end: endTimeStamp,
            text: row['text']
          }

          webVTTRaw.push(entry)
        })

        console.log("JSON Raw")
        console.log(rawJSON)
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

    // async function handleDownload(finalRecording) {
    //     console.log("Downloading...")
    //     if (finalRecording) {
    //     // await chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //     //   chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRecording", data: finalRecording})
    //     // }).then(() => {
    //     chrome.storage.local.set({
    //         rawJSON: [],
    //         recordedChunks: []
    //     })
    // })
    //     console.log("DEBUG: Recording passed to download")
    //     }

    //     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    //         chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawData", data: rawJSON})
    //     })
    // }
}

export default FileProcess