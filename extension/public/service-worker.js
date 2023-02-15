import moment from '/node_modules/moment'
import ffmpeg from '/node_modules/ffmpeg.js/ffmpeg-worker-webm'

let recording = false;
const startTimeStamp = new Date()
// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    console.log("Message recieved: " + request.message)
    if (request.message === "start_capture") {
      console.log("Screen capture started")
      recording = true
    }
    if (request.message === "start_navigation_tracking") {
      startNavigationTracking()
      recording = true
    }
    if (request.message === "start_mouse_tracking") {
      startMouseTracking()
      recording = true
    }
    // Track any click evenet
    if (request.message === "click_tracked") {
      mouseTracking.push(request.data)
    }
    if (request.message === "reset") {
      recording = false
      console.log("resetting")
      stopNavigationTracking()
      stopMouseTracking()
    }
     // Message from user
     if (request.message === "stop_recording") {
      recording = false
    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      recordedChunks = request.data
      recording = false
    }
    if (request.message === "feedback_recieved") {
      console.log("Feedback finished. Processing data...")
      processJSON()
    }
  });


// VARIABLES
let mouseTracking = []
let navigationData = []
let recordedChunks = []

// FUNCTIONS
function handleDownload(finalRecording) {
  console.log("Downloading...")
  if (finalRecording) {
 // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  //   chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRecording", data: finalRecording})
  // })
  console.log("DEBUG: Recording passed to download")
  }
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "downloadRawData", data: rawJSON})
    })
  })
  stopMouseTracking()
  stopNavigationTracking()
}
// TODO: Add alert on tab refresh, close or browser close -> Screen recorder shuts down if so


// Save navigational data
function formatNavigationData(data) {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  data.timeStampVTT = hours + ":" + minutes + ":" + seconds + "." + milliseconds
  data.timeStamp = date.getTime()
  data.hours = hours
  data.minutes = minutes
  data.seconds = seconds
  data.milliseconds = milliseconds
  console.log(data)
  navigationData.push(data)
}

function uploadRecordingToServer(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  // console.log(recBlob)
  // Transfer to cloud
  // Downloading from service-worker.js not possible, since URL is not accessible by the service-worker -> API only

  let navigation_tracking = JSON.stringify(navigationData);
  let mouse_tracking = JSON.stringify(mouseTracking)
  console.log(navigation_tracking)
  console.log(mouseTracking)
}

// Start and stop the meta collection when recording has been started
function startNavigationTracking() {
  console.log("Navigation tracking started")
  chrome.webNavigation.onCommitted.addListener((details) => {
    var documentId = details["documentId"]
    var frameId = details["frameId"]
    var frameType = details["frameType"]
    var transitionType = details["transitionType"]
    formatNavigationData(details)
  })
}

function stopNavigationTracking() {
  console.log("Stopped navigation capturing")
  chrome.webNavigation.onCommitted.removeListener(startNavigationTracking)
  navigationData = []
}

function startMouseTracking() {
  console.log("Mouse tracking started")
  let currentTab;
  // Cover all tab interactions
  chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
      chrome.tabs.onActivated.addListener( (activeInfo) => {
        currentTab = activeInfo.tabId;
        chrome.scripting.executeScript({
          target: {tabId: activeInfo.tabId},
          files: ["scripts/mouse-behaviour.js"]
        }
        )
      });
    }
  })
  // Cover for newly created tabs, since extension gods "reloaded" on every change
  chrome.tabs.onCreated.addListener( (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
      chrome.scripting.executeScript({
        target: {tabId: tabId.tabId, allFrames: true},
        files: ["scripts/mouse-behaviour.js"]
      });
    }
  })
}

function stopMouseTracking() {
  console.log("Stopped mouse capturing")
  chrome.tabs.onUpdated.removeListener(startMouseTracking)
  mouseTracking = []
}

async function processJSON() {
  // 1. Create concat file from NavData, ClickData & Feedback
  let label = undefined
  let screen = true

  await chrome.storage.sync.get(['screen']).then((resp) => {
    screen = resp.screen
  })
  await chrome.storage.sync.get(['label']).then((resp) => {
    label = resp.label
    })

  rawJSON = {
    navData: navigationData,
    clickData: mouseTracking,
    label: label
  }
  // chrome.storage.sync.set({
  //   rawJSON: rawJSON
  // })

  let raw = []
  navigationData.forEach((row) =>{
    let nestedDict = {
      timeStamp: row['timeStamp'],
      text: row['transitionType']
    }
    raw.push(nestedDict)
  })

  mouseTracking.forEach((row) =>{
    let nestedDict = {
      timeStamp: row['timeStamp'],
      text: 'Click on ' + row['tag'] + ' tracked'
    }
    raw.push(nestedDict)
  })

  let webVTTRaw = []
  let rawJSON = []
  let base = new Date("1970-01-01T" + startTimeStamp);
  // 2. For each row in the new JSON, create the difference between the first timeStamp and all others
  // 2.1
  raw.forEach((row) => {

    const timestamp = row["timestamp"];
    const timeValue = moment.duration(timestamp).asMilliseconds();
    const startTimeStamp = moment.utc(timeValue).format('HH:mm:ss.SSS');

    const date = new Date(Date.parse(`1970-01-01T${startTimeStamp}Z`));
    date.setSeconds(date.getSeconds() + 2);
    const endTimeStamp = date.toISOString().substring(11, 12);
    console.log(startTimeStamp); // Output: 00:01:32.000
    console.log(endTimeStamp); // output formatted timestamp


    const entry = {
      start: startTimeStamp,
      end: endTimeStamp,
      text: row['text']
    }

    webVTTRaw.push(entry)
  })

  // Save to local storage
  // chrome.storage.sync.set({
  //   jsonData: rawJSON,
  //   webVTTRaw: webVTTRaw,
  // })

  console.log("JSON Raw")
  console.log(rawJSON)
  console.log("WebVTTRaw")
  console.log(webVTTRaw)
  if (screen) {
    await embedSubtitles(webVTTRaw).then((resp) =>{
      handleDownload(resp.outputFilename)
    })}
  else {
    handleDownload()
  }
}

async function embedSubtitles(webVTTRaw) {
  const timeStamp = new Date()
  // EXAMPLE how it can be parsed
  const obj = webVTTRaw;
  const webvtt = 'WEBVTT\n\n';

  // iterate over the captions and create a WebVTT cue for each one
  obj.forEach(caption => {
    webvtt += `${caption.start} --> ${caption.end}\n`;
    webvtt += `${caption.text}\n\n`;
  });

  // Run FFmpeg to embed the subtitles in the video
  const outputFilename = `${timeStamp}_usba.mp4`;
  const args = [
    "-i", recordedChunks,
    "-i", "data:text/vtt;base64," + btoa(webvtt),
    "-c", "copy",
    outputFilename
  ];
  ffmpeg().run(...args);

  // Download the output file
  return outputFilename
}