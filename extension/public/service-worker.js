console.log('Backgroundworker active')

let clicks = []
let recording = false;

// MAIN FUNCTION ORCHESTRATION
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      startMetaCollection()
      record()
      recording = true
      console.log(recording)
    }
    if (request.message === "stop_recording") {
      stopMetaCollection()
      recording = getFormHelperTextUtilityClasses
      console.log(recording)
    }
    // Track any click evenet
    if (request.message === "click_tracked") {
      clicks.push(request.data)
      console.log(request.data)
    }
    // DEBUG
    if (request.message === "reset_timer") {
      recording = false
      console.log(clicks)
      console.log(navigationData)
    }
  });

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

chrome.runtime.getPackageDirectoryEntry((root) => {
  root.getFile('config.json', {}, (file) => {
    const reader = new FileReader();
    reader.onload = () => {
        // Parse the contents of the config.json file as JSON
        const config = JSON.parse(reader.result);
        const recordType = config.recordType;

        // Use config settings

    };
    reader.onerror = (event) => {
        console.error("File could not be read! Code " + event.target.error.code);
    }
    reader.readAsText(file);
  });
});
function record () {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ["scripts/recorder_debug.js"]
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
    console.log('DocumentID: ', documentId)
    console.log('FrameId: ', frameId)
    console.log('FrameType: ', frameType)
    console.log('TransitionType: ', transitionType)
    formatNavigationData(details)
  })
}

function stopMetaCollection() {
  chrome.webNavigation.onCommitted.removeListener(startMetaCollection)
}
