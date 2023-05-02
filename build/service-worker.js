// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if (request.message === "start_navigation_tracking") {
      isNavTrackingEnabled = true
      startNavigationTracking()
    }
    if (request.message === "start_click_tracking") {
      isClickTrackingEnabled = true
      startClickTracking()
    }
    if (request.message === "start_screen_recording") {
      isScreenRecording = true
      startScreenRecording()
    }
    if (request.message === "stop_screen_recording") {
      stopScreenRecording()
    }
    // Track any click event
    if (request.message === "click_tracked") {
      console.log(request.data)
      if (isClickTrackingEnabled) {
        mouseTracking.push(request.data)
      }
    }
    if (request.message === "reset") {
      console.log("resetting")
      isClickTrackingEnabled = false
      isNavTrackingEnabled = false
      stopNavigationTracking()
      stopClickTracking()
      stopScreenRecording()
      resetData()
    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      recordedChunks = request.data
    }
    if (request.message === "rec_permission_denied") {
      console.log("DEBUG: Screen rec denied")
      isClickTrackingEnabled = false
      isNavTrackingEnabled = false
    }
    if (request.message === "feedback_recieved") {
      console.log("Preparing rawJSON")
      isClickTrackingEnabled = false
      isNavTrackingEnabled = false
      stopClickTracking()
      stopNavigationTracking()
      const resp = await preprocessJSON()
      sendResponse(resp)
    }
  });

// VARIABLES
let mouseTracking = []
let navigationData = []
let recordedChunks = []
let isNavTrackingEnabled = false
let isClickTrackingEnabled = false
let isScreenRecording = false

// FUNCTIONS
// Save navigational data
let formatNavigationData = (data) => {
  var date = new Date ();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  data.timeStampVTT = hours + ":" + minutes + ":" + seconds + "." + milliseconds
  console.log(data)
  if (data.transitionType !== 'auto_subframe' && isNavTrackingEnabled){
    navigationData.push(data)
  }
}

function uploadRecordingToServer(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  // OPTION FOR ADDING API CALL TO ANY CLOUD STORAGE
  let navigation_tracking = JSON.stringify(navigationData);
  let mouse_tracking = JSON.stringify(mouseTracking)
}

function startScreenRecording() {
  // TODO: Might not work
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "start"});
    })
    if(chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
        alert("Please enter a website. The extensions access is not allowed from home pages.")
    }
  })
}

function stopScreenRecording() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "stop"});
    })
  })
}

// Start and stop the meta collection when recording has been started
function startNavigationTracking() {
  chrome.webNavigation.onCommitted.addListener(navTracker)
}

function stopNavigationTracking() {
  chrome.webNavigation.onCommitted.removeListener(navTracker)
}

const onUpdatedListener = (tabId, changeInfo, tab) => {
  if(changeInfo.status == "complete") {
    chrome.tabs.sendMessage(tabId, { message: "start_click_tracking" });
  }
}

const onCreatedListener = (tab) => {
  chrome.tabs.sendMessage(tab.id, { message: "start_click_tracking" })
}

function startClickTracking() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "start_click_tracking"});
    })
  })
  // Cover all tab interactions
  chrome.tabs.onUpdated.addListener(onUpdatedListener)

  // Cover for newly created tabs, since extension gets "reloaded" on every change
  chrome.tabs.onCreated.addListener(onCreatedListener)
}

function stopClickTracking() {
  chrome.tabs.query({}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {message: "stop_click_tracking"});
  })
  chrome.tabs.onUpdated.removeListener(onUpdatedListener)
  chrome.tabs.onCreated.removeListener(onCreatedListener)
}

async function preprocessJSON() {
  // 1. Create concat file from NavData, ClickData & Feedback
  let rawJSON = undefined

  const label = await chrome.storage.local.get(['label'])
  rawJSON = {
      navData: navigationData,
      clickData: mouseTracking,
      label: label.label
    }

  console.log(rawJSON)
  await chrome.storage.local.set({rawJSON: rawJSON}).then(() => {
    navigationData = [],
    mouseTracking = []
  }
  )
}

function resetData() {
  mouseTracking = []
  navigationData = []
}


// Listener functions
function pageUpdateListener(tabId, changeInfo, tab) {
  // Cover all tab interactions
    if(changeInfo.status == "complete") {
      chrome.tabs.sendMessage(tabId, { message: "start_click_tracking" });
    }
  }

function pageCreatedListener(tabId) {
  chrome.tabs.sendMessage(tabId, { message: "start_click_tracking" })
}

function navTracker(details) {
  details.timeStamp = Date.now()
  formatNavigationData(details)
}