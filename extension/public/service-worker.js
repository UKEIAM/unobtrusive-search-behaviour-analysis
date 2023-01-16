console.log('Backgroundworker active')

// API CALLS
var recording = false;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      startRecording();
      console.log(recording)
    } else if (request.message === "stop_recording") {
      stopRecording();
    }
  });

chrome.webNavigation.onCommitted.addListener((details) => {
    documentId = details['documentId']
    frameId = details['frameId']
    frameType = details['frameType']
    transitionType = details['transitionType']
    formatNavigationData(details)
})


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

// TODO: For debug, download recording to machine after mediarecorder has recorded
const downloadRecordingPath = 'TestRecording'
const downloadRecordingType = 'mp4'
const downloadRecording = () => {
    const pathName = `${downloadRecordingPath}_${recordingNumber}.${downloadRecordingType}`;
    try {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(mediaBlobUrl, pathName);
      } else {
        // for Chrome
        const link = document.createElement("a");
        link.href = mediaBlobUrl;
        link.download = pathName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error(err);
    }
  };
