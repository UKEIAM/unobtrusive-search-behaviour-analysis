let recording = false;

let state = {
  screen: true,
  navigation: true,
  mouse: true,
}

// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "check_state") {
      console.log(state)
      sendResponse({"state": state, "recording": recording})
    }
    if (request.message === "start_capture") {
      state.screen = request.flag
      recording = true
    }
    // message from user
    if (request.message === "stop_recording") {
      stopNavigationTracking()
      stopMouseTracking()
      stopCapture()
      recording = false
    }
    if (request.message === "start_navigation_tracking") {
      startNavigationTracking()
      state.nav = request.flag
      recording = true
    }
    if (request.message === "start_mouse_tracking") {
      startMouseTracking()
      state.mouse = request.flag
      recording = true
    }
    // Track any click evenet
    if (request.message === "click_tracked") {
      mouseTracking.push(request.data)
    }
    if (request.message === "reset") {
      recording = false
      console.log('resetting')
      stopNavigationTracking()
      stopMouseTracking()
    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      // handleDownload()
      stopNavigationTracking()
      stopMouseTracking()
      recording = false
      // uploadRecordingToServer(data.recordedChunks)
    }
    if (request.message === "finished_feedback") {
      console.log(request.data)
      //handleDownload(request.data)
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
  console.log('Navigation tracking started')
  chrome.webNavigation.onCommitted.addListener((details) => {
    var documentId = details['documentId']
    var frameId = details['frameId']
    var frameType = details['frameType']
    var transitionType = details['transitionType']
    formatNavigationData(details)
  })
}

function stopNavigationTracking() {
  chrome.webNavigation.onCommitted.removeListener(startNavigationTracking)
  navigationData = []
}

function startMouseTracking() {
  console.log('Mouse tracking started')
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
  chrome.tabs.onUpdated.removeListener(startMouseTracking)
  mouseTracking = []
}


async function stopCapture() {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  const response = await chrome.tabs.sendMessage(tab.id, {greeting: "stop"});
}