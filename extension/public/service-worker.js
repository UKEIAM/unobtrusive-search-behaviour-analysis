console.log('Backgroundworker active')

// MAIN FUNCTION ORCHESTRATION
var recording = false;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      startRecording();
      startMetaCollection();
      console.log(recording)
    } else if (request.message === "stop_recording") {
      stopRecording();
      stopMetaCollection();
    }
  });

// HELPER
// Read config file
chrome.runtime.getPackageDirectoryEntry((root) => {
  root.getFile('config.json', {}, (file) => {
    const reader = new FileReader();
    reader.onload = () => {
    const config = JSON.parse(reader.result);
    const recordType = config.recordType;
    };
    reader.readAsText(file);
  });
});



// FUNCTIONS
function startRecording() {
  navigator.mediaDevices.getUserMedia({ screen: true }).then((stream) => {
    // Create a new MediaRecorder object
    const options = { mimeType: "video/webm; codecs=vp9" };
    const recorder = new MediaRecorder(stream, options);

    // Start recording
    recorder.start();

    // Listen for the dataavailable event
    recorder.addEventListener('dataavailable', (event) => {
      // TODO: Case of handling file depending on the config.json
        // If config.json/ upload -> upload to server
        // Otherwise, download locally
        const audioBlob = event.data;
        const url = URL.createObjectURL(audioBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'recording.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    });
});
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

// Start and stop the meta collection when recording has been started
function startMetaCollection() {
  chrome.webNavigation.onCommitted.addListener((details) => {
    documentId = details['documentId']
    frameId = details['frameId']
    frameType = details['frameType']
    transitionType = details['transitionType']
    formatNavigationData(details)
  })
}

function stopMetaCollection() {
  chrome.webNavigation.onCommitted.removeListener(startMetaCollection)
}
