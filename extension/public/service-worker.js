let recording = false;

// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
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
      console.log(navigationData)
      console.log(mouseTracking)
      stopNavigationTracking()
      stopMouseTracking()
      recording = false
      // uploadRecordingToServer(data.recordedChunks)
    }
    if (request.message === "feedback_recieved") {
      console.log("Feedback finished. Processing data...")
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
function handleDownload(feedback) {
  console.log("Download")
  let searchFeedback = { success: feedback}
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "download", data: [searchFeedback, mouseTracking, navigationData] })
  })
  stopMouseTracking()
  stopNavigationTracking()
}
// Save navigational data
function formatNavigationData(data) {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  data.timeStamp = hours + ":" + minutes + ":" + seconds + "." + milliseconds
  console.log(data.timeStamp)
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