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
    // Track any click event
    if (request.message === "click_tracked") {
      if (isClickTrackingEnabled) {
        console.log(request.data)
        mouseTracking.push(request.data)
      }
    }
    if (request.message === "reset") {
      console.log("resetting")
      isClickTrackingEnabled = false
      isNavTrackingEnabled = false
      stopNavigationTracking()
      stopClickTracking()
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
      const resolve = await preprocessJSON()
      sendResponse(resolve)
    }
  });

// VARIABLES
let mouseTracking = []
let navigationData = []
let recordedChunks = []
let isNavTrackingEnabled = false
let isClickTrackingEnabled = false

// FUNCTIONS
// Save navigational data
let formatNavigationData = (data) => {
  var date = new Date ();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  data.timeStampVTT = hours + ":" + minutes + ":" + seconds + "." + milliseconds
  if (data.transitionType !== 'auto_subframe' && isNavTrackingEnabled){
    navigationData.push(data)
    console.log(data)
  }
}

function uploadRecordingToServer(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  // OPTION FOR ADDING API CALL TO ANY CLOUD STORAGE
  let navigation_tracking = JSON.stringify(navigationData);
  let mouse_tracking = JSON.stringify(mouseTracking)
}

// Start and stop the meta collection when recording has been started
function startNavigationTracking() {
  chrome.webNavigation.onCommitted.addListener((details) => {
    details.timeStamp = Date.now()
    formatNavigationData(details)
  })
}

function stopNavigationTracking() {
  console.log("Stopped navigation capturing")
  chrome.webNavigation.onCommitted.removeListener(formatNavigationData)
}

function startClickTracking() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "start_click_tracking"});
    })
  })
  const onUpdatedListener = (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
      chrome.tabs.sendMessage(tabId, { message: "start_click_tracking" });
    }
  }
  // Cover all tab interactions
  chrome.tabs.onUpdated.addListener(onUpdatedListener)

  const onCreatedListener = (tab) => {
    chrome.tabs.sendMessage(tab.id, { message: "start_click_tracking" })
}
  // Cover for newly created tabs, since extension gets "reloaded" on every change
  chrome.tabs.onCreated.addListener(onCreatedListener)
}

function stopClickTracking() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "stop_click_tracking"});
    })
  })
  chrome.tabs.onCreated.removeListener(onCreatedListener)
  chrome.tabs.onUpdated.removeListener(onUpdatedListener)
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