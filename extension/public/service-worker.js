console.log('Backgroundworker active')

// API CALLS
var recording = false;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      startRecording();
      recording = true
    } else if (request.message === "stop_recording") {
      stopRecording();
      recording = false
    }
  });

if (recording) {
    chrome.webNavigation.onCommitted.addListener((details) => {
        documentId = details['documentId']
        frameId = details['frameId']
        frameType = details['frameType']
        transitionType = details['transitionType']
        formatNavigationData(details)
    })
}

// FUNCTIONS
function startRecording() {
  recording = true;
  console.log('Recording')
  // Code to start the recording using the react-media-record package
}

function stopRecording() {
  recording = false;
  console.log('Stopping')
  // Code to stop the recording and save it to a file
}

// Is there a way to pass data from service worker to react app?
var navigationData = []
function formatNavigationData(data) {
    navigationData.push(data)
}