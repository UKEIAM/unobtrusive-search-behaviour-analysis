chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.message === 'reset') {
      console.log("Stopped screen capturing")
      cancelled = true
      resetRecorder()
    }
    if(request.message === 'start') {
      startCapture()
    }
    if(request.message === 'stop') {
      console.log("Stopped screen capturing")
      stopCapture()
    }
    if(request.message === 'downloadRecording') {
      download(request.data)
    }
  }
)

let cancelled = false
let timeStamp = Date.now()

const displayMediaOptions = {
  video: {
    displaySurface: "monitor"
  },
  audio: false
};

let recorder;
let recordedChunks=[];
let stream;

function startCapture() {
  navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then((s) => {
    stream = s
    // Create a new MediaRecorder object
    const options = { mimeType: "video/webm; codecs=vp9" };
    recorder = new MediaRecorder(stream, options);
    // Start recording
    recorder.ondataavailable = (e) => {
      recordedChunks.push(e.data)
    };
    recorder.start();
    recorder.onstop = (e) => {
      changeRecordingState()
      if (cancelled){
        console.log(recorder.state)
      }
      else {
        chrome.storage.local.set({
          triggerFeedback: true,
          recordedChunks: recordedChunks
        })
      }
    }
  }).catch((err) => {
    console.error(`Error:${err}`)
    chrome.storage.local.set({
      recording: false
  }); return })
}

function sendRecordedChunks () {
  chrome.runtime.sendMessage({ message: 'capture_stopped', data: recordedChunks})
}

function stopCapture () {
  recorder.stop()
}

function resetRecorder () {
  console.log('stopping')
  recorder.stop()
}

function changeRecordingState() {
  chrome.storage.local.set({
    recording: false
  }, () => {
    console.log("Recording state changed from recorder.js")
  })
}

function download (data) {
  console.log("Downloading...")
  const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = outputFilename;
  link.click();
  URL.revokeObjectURL(url);
//sendRecordedChunks()
}


