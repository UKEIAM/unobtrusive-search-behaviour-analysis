// MAIN FUNCTION ORCHESTRATION
const startTimeStamp = new Date()
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
    }
     // Message from user
     if (request.message === "stop_recording") {
      stopClickTracking()
      stopNavigationTracking()
    }
    // Message from recorder
    if (request.message === "capture_stopped") {
      recordedChunks = request.data
    }
    if (request.message === "feedback_recieved") {
      console.log("Feedback finished. Processing data...")
      stopClickTracking()
      stopNavigationTracking()
      await preprocessJSON().then(() => {
        sendResponse({resp: 'rawJSON Saved'})
      })
    }
  });

// VARIABLES
let mouseTracking = []
let navigationData = []
let recordedChunks = []

// FUNCTIONS
function handleDownload(finalRecording) {
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
  if (data.transitionType !== 'auto_subframe'){
    navigationData.push(data)
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
  console.log(mouseTracking)
}

// Start and stop the meta collection when recording has been started
function startNavigationTracking() {
  console.log("Navigation tracking started")
  chrome.webNavigation.onCommitted.addListener((details) => {
    formatNavigationData(details)
  })
}

function stopNavigationTracking() {
  console.log("Stopped navigation capturing")
  chrome.webNavigation.onCommitted.removeListener(startNavigationTracking)
}

function startClickTracking() {
  console.log("Mouse tracking started")

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "start_click_tracking" }).then((resp) => {
    })
  })
  // Cover all tab interactions
  chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
          chrome.tabs.sendMessage(tabId, { message: "start_click_tracking" }).then((resp) => {
      });
    }
  })
  // Cover for newly created tabs, since extension gods "reloaded" on every change
  chrome.tabs.onCreated.addListener( (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
      chrome.tabs.sendMessage(tabsId, { message: "start_click_tracking" }).then((resp) => {
      })
    }
  })
}

function stopClickTracking() {
  chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    if(changeInfo.status == "complete") {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "stop_click_tracking" }).then((resp) => {
        })
      })
    }
  })
}


async function preprocessJSON() {
  // 1. Create concat file from NavData, ClickData & Feedback
  let label = undefined
  let screen = true

  await chrome.storage.sync.get(['screen']).then((resp) => {
    screen = resp.screen
  })
  await chrome.storage.sync.get(['label']).then((resp) => {
    label = resp.label
    })

  const rawJSON = {
    navData: navigationData,
    clickData: mouseTracking,
    label: label
  }
  // chrome.storage.sync.set({
  //   rawJSON: rawJSON
  // })
  await chrome.storage.local.set({
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