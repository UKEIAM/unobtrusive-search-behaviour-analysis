
let recording = false;

// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
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
      stopNavigationTracking()
      stopMouseTracking()
    }
    if (request.message === "recording_stopped") {
      handleDownload()
      stopNavigationTracking()
      stopMouseTracking()
      recording = false
      // uploadAPI(data.recordedChunks)
    }
  });


// VARIABLES
let mouseTracking = []
let navigationData = []

// FUNCTIONS
function handleDownload() {
  console.log("Download")
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "download", data: [mouseTracking, navigationData] })
  })
  stopMouseTracking()
  stopNavigationTracking()
}
// Save navigational data
function formatNavigationData(data) {
    navigationData.push(data)
}

function handleRecording(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  console.log(recBlob)
  // Transfer to cloud
  // Downloading from service-worker.js not possible, since URL is not accessible by the service-worker -> API only

  let navigation_tracking = JSON.stringify(navigationData);
  console.log(navigation_tracking)
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