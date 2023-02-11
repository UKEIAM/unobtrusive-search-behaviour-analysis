
console.log('Recorder started')
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
    recording = true
    recorder.ondataavailable = (e) => {
      recordedChunks.push(e.data)
    };
    recorder.start();
    console.log(recorder.state);

    recorder.onstop = (e) => {
      changeRecordingState()
      if (cancelled){
        console.log(recorder.state)
      }
      else {
        // TODO: First change state to trigger feedback component. Then download data.
        chrome.storage.sync.set({
          triggerfeedback: true
        })
        download()
      }
    }
  }).catch((err) => { console.error(`Error:${err}`); return })
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
  chrome.storage.sync.set({
    recording: false
  }, () => {
    console.log("Recording state changed from recorder.js")
  })
}

function download (recordedChunks) {
  console.log(recorder.state)
  const blob = new Blob(recordedChunks)
  const link = document.createElement('a');
  link.style.display = "none";
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `recording_${timeStamp}.webm`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link)
  URL.revokeObjectURL(url);
  sendRecordedChunks()
}
