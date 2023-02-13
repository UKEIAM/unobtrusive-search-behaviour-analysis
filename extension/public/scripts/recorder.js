
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
    if(request.message === 'download') {
      parseToWebVTT()
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
          triggerFeedback: true
        })
        // TODO: Remove once feedback logic works
        // download()
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

function download (file) {
  console.log("Downloading...")
  console.log(recorder.state)
  const blob = new Blob(file)
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

function parseToWebVTT() {

  // Correct import?
  const ffmpeg = require("ffmpeg.js");
  // EXAMPLE how it can be parsed
  const webVTTRaw = undefined
  chrome.storage.sync.get(["webVTTRaw"]).then((resp) => {
    webVTTRaw = resp.webVTTRaw
  })
  obj = JSON.parse(webVTTRaw)
  const webvtt = 'WEBVTT\n\n';

  // iterate over the captions and create a WebVTT cue for each one
  obj.forEach(caption => {
    webvtt += `${caption.start} --> ${caption.end}\n`;
    webvtt += `${caption.text}\n\n`;
  });

  // save the WebVTT file
  chrome.storage.sync.set({
    webVTT: webvtt
  })
  // Not sure if this is going to work correctly
  let newVideoFile = null
  ffmpeg().input(recordedChunks).input(webvtt).output(newVideoFile).run()

  download(newVideoFile)
}
