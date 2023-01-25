
console.log('Backgroundworker active')

let clicks = []
let recording = false;
let startTimestamp = null

// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      record()
      startMetaCollection()
      startTimestamp = request.data
      recording = true
    }
    // Track any click evenet
    if (request.message === "click_tracked") {
      clicks.push(request.data)
    }
    // DEBUG
    if (request.message === "reset_timer") {
      recording = false
      console.log(String(startTimestamp))
      clicks = []
      stopMetaCollection()
    }
    if (request.message === "recording_stopped") {
      startMetaCollection()
      recording = false
      handleDownload()
      // uploadAPI(data.recordedChunks)
    }
  });

// chrome.runtime.addEventListener('activate', (e) => {

// })

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

// HELPER
// Read config file


// FUNCTIONS
// Save navigational data
let navigationData = []
function formatNavigationData(data) {
    navigationData.push(data)
}

// chrome.runtime.getPackageDirectoryEntry((root) => {
//   root.getFile('config.json', {}, (file) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//         // Parse the contents of the config.json file as JSON
//         const config = JSON.parse(reader.result);
//         const recordType = config.recordType;

//         // Use config settings

//     };
//     reader.onerror = (event) => {
//         console.error("File could not be read! Code " + event.target.error.code);
//     }
//     reader.readAsText(file);
//   });
// });

function handleRecording(recordedChunks) {
  let recBlob = new Blob(recordedChunks)
  console.log(recBlob)
  // Transfer to cloud
  // Downloading from service-worker.js not possible, since URL is not accessible by the service-worker -> API only

  let navigation_tracking = JSON.stringify(navigationData);
  console.log(navigation_tracking)
  // var blob = new Blob([navigation_tracking], {type : 'application/json'});
  // var url = URL.createObjectURL(blob);

  // chrome.downloads.download({
  //   url: url,
  //   filename: "navigation_tracking.json" // Optional
  // });
}

function record () {
   chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id, allFrames: true},
      files: ["scripts/mouse-behaviour.js"]
    });
            })
}

// Start and stop the meta collection when recording has been started
function startMetaCollection() {
  chrome.webNavigation.onCommitted.addListener((details) => {
    var documentId = details['documentId']
    var frameId = details['frameId']
    var frameType = details['frameType']
    var transitionType = details['transitionType']
    formatNavigationData(details)
  })
}

function stopMetaCollection() {
  chrome.webNavigation.onCommitted.removeListener(startMetaCollection)
  navigationData = []
}

function handleDownload() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "download", data: clicks })
})
  clicks = []
}