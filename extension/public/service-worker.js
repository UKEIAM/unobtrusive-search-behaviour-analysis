// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    //safetyFunction()
    if (request.message === "start_navigation_tracking") {
      startNavigationTracking()
    }
    if (request.message === "start_click_tracking") {
      startClickTracking()
    }
    // Track any click evenet
    if (request.message === "click_tracked") {
      console.log(request.data)
      mouseTracking.push(request.data)
    }
    if (request.message === "reset") {
      console.log("resetting")
      stopNavigationTracking()
      stopClickTracking()
      resetData()

    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      recordedChunks = request.data
    }
    if (request.message === "feedback_recieved") {
      console.log("Feedback finished. Processing data...")
      stopClickTracking()
      stopNavigationTracking()
      preprocessJSON()
    }
  });

// VARIABLES
let mouseTracking = []
let navigationData = []
let recordedChunks = []
// FUNCTIONS

// Save navigational data
function formatNavigationData(data) {
  var date = new Date ();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
  data.timeStampVTT = hours + ":" + minutes + ":" + seconds + "." + milliseconds
  if (data.transitionType !== 'auto_subframe'){
    navigationData.push(data)
    console.log(data)
  }
}

function uploadRecordingToServer(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  // console.log(recBlob)
  // Transfer to cloud
  // Downloading from service-worker.js not possible, since URL is not accessible by the service-worker -> API only

  let navigation_tracking = JSON.stringify(navigationData);
  let mouse_tracking = JSON.stringify(mouseTracking)
  console.log(navigation_tracking)
  console.log(mouse_tracking)
}

// Start and stop the meta collection when recording has been started
function startNavigationTracking() {
  console.log("Navigation tracking started")
  chrome.webNavigation.onCommitted.addListener((details) => {
    details.timeStamp = Date.now()
    formatNavigationData(details)
  })
}

function stopNavigationTracking() {
  console.log("Stopped navigation capturing")
  chrome.webNavigation.onCommitted.removeListener(startNavigationTracking)
}

function startClickTracking() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "start_click_tracking"});
    })
  })
  // TODO: Listeners are not firing currently
  // Cover all tab interactions
  chrome.tabs.onUpdated.addListener( (changeInfo, tab) => {
    if (changeInfo.status === "complete") {
          chrome.tabs.sendMessage(tab.id, { message: "start_click_tracking" });
    }
  })
  // Cover for newly created tabs, since extension gets "reloaded" on every change
  chrome.tabs.onCreated.addListener( (tab) => {
    if(tab.status == "complete") {
      chrome.tabs.sendMessage(tab.id, { message: "start_click_tracking" })
   }
  })
}

function stopClickTracking() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {message: "stop_click_tracking"});
    })
  })
  chrome.tabs.onUpdated.removeListener()
  chrome.tabs.onCreated.removeListener()

}


function preprocessJSON() {
  // 1. Create concat file from NavData, ClickData & Feedback
  let label = undefined
  let screen = true

  chrome.storage.local.get(['screen']).then((resp) => {
    screen = resp.screen
  })
  chrome.storage.local.get(['label']).then((resp) => {
    label = resp.label
    })

  const rawJSON = {
    navData: navigationData,
    clickData: mouseTracking,
    label: label
  }
  console.log(rawJSON)
  chrome.storage.local.set({
    rawJSON: rawJSON
  }).then(() =>
    navigationData = [],
    mouseTracking = []
  )

}

// function safetyFunction() {
//   chrome.tabs.onCreated.addListener('beforeunload', (e) => {
//     alert('Closing or reloading the tab deletes all collected data. Are you sure?')
//   })
//   chrome.tabs.onUpadted.addListener('beforeunload', (e) => {
//     alert('Closing or reloading the tab deletes all collected data. Are you sure?')
//   })
//}

function resetData() {
  mouseTracking = []
  navigationData = []
}