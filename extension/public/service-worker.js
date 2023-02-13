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
      console.log(request.data)
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
      stopNavigationTracking()
      stopMouseTracking()
      recording = false
    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      // handleDownload()
      //stopNavigationTracking()
      //stopMouseTracking()
      recording = false
      // uploadRecordingToServer(data.recordedChunks)
    }
    if (request.message === "feedback_recieved") {
      console.log("Feedback finished. Processing data...")
      await processJSON()
      stopNavigationTracking()
      stopMouseTracking()
      // TODO: Debugg downloading of raw data
      // Consider more logic befor downlaoding
      // handleDownload(request.data)
      // uploadRecordingToServer()
    }
  });


// VARIABLES
let mouseTracking = []
let navigationData = []

// FUNCTIONS
function handleDownload() {
  console.log("Download")
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "download" })
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
  data.timeStamp = hours + ":" + minutes + ":" + seconds + "." + milliseconds
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

function processJSON() {
  // 1. Create concat file from NavData, ClickData & Feedback
  const label = chrome.storage.sync.get(['label'])
  let jsonRaw = {
    navData: navigationData,
    clickData: mouseTracking,
    label: label
  }
  chrome.storage.sync.set({
    jsonRaw: jsonRaw
  })

  let raw = []
  navigationData.forEach((row) =>{
    let nestedDict = {
      timeStamp: row['timeStamp'],
      text: row['transistionType']
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
  let base = new Date("1970-01-01T" + startTimeStamp);
  // 2. For each row in the new JSON, create the difference between the first timeStamp and all others
  // 2.1
  raw.forEach((row) => {
    // transform Timestamp
    var date2 = new Date("1970-01-01T" + row['timeStamp']); //get correct timestamp value from row
    var timeDiff = date2.getTime() - base.getTime();
    var timeDiffForDisplay = (date2.getTime()+200) - base.getTime(); // Add 2 secnonds of display

    var hours = Math.floor(timeDiff / (60 * 60 * 1000));
    var timeDiff = timeDiff % (60 * 60 * 1000);
    var hoursFD = Math.floor(timeDiffForDisplay / (60 * 60 * 1000));
    var timeDiffForDisplay = timeDiffForDisplay % (60 * 60 * 1000);

    var minutes = Math.floor(timeDiff / (60 * 1000));
    var timeDiff = timeDiff % (60 * 1000);
    var minutesFD = Math.floor(timeDiffForDisplay / (60 * 1000));
    var timeDiffForDisplay = timeDiffForDisplay % (60 * 1000);

    var seconds = Math.floor(timeDiff / 1000);
    var milliseconds = timeDiff % 1000;
    var secondsFD = Math.floor(timeDiffForDisplay / 1000);
    var millisecondsFD = timeDiffForDisplay % 1000;

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    milliseconds = (milliseconds < 10) ? "00" + milliseconds : (milliseconds < 100) ? "0" + milliseconds : milliseconds;

    hoursFD = (hoursFD < 10) ? "0" + hoursFD : hoursFD;
    mintuesFD = (mintuesFD < 10) ? "0" + mintuesFD : mintuesFD;
    secondsFD = (secondsFD < 10) ? "0" + secondsFD : secondsFD;
    millisecondsFD = (millisecondsFD < 10) ? "00" + millisecondsFD : (millisecondsFD < 100) ? "0" + millisecondsFD : millisecondsFD;

    var start = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    var end = hoursFD + ":" + minutesFD + ":" + secondsFD + "." + millisecondsFD;

    const entry = {
      start: start,
      end: end,
      text: row['text']
    }

    webVTTRaw.push(entry)
  })

  // Save to local storage
  chrome.storage.sync.set({
    jsonData: jsonRaw,
    webVTTRaw: webVTTRaw,
  })

  // Handle download of json files
  handleDownload()
}