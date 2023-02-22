import { defineLocale } from "moment"

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Recording message received")
    if(request.message === "reset") {
      console.log("Stopped screen capturing")
      cancelled = true
      resetRecorder()
    }
    if(request.message === "start") {
      startCapture()
    }
    if(request.message === "stop") {
      console.log("Stopped screen capturing")
      stopCapture()
    }
    if(request.message === "downloadProcessedRec") {
      downloadProcessed(request.data)
    }
    if(request.message === "downloadRawRec")
      downloadRaw()
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

function handleBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = "Data will be lost if you leave the page, are you sure?";
}

function startCapture() {
  window.addEventListener("beforeunload", handleBeforeUnload)
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
      window.removeEventListener("beforeunload", handleBeforeUnload)
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
    chrome.webNavigation.onCommitted.removeListener(formatNavigationData)
    chrome.runtime.sendMessage({ message: "rec_permission_denied" })
    console.error(`Error:${err}`)
    chrome.storage.local.set({
      recording: false
  }); return })
}

function sendRecordedChunks () {
  chrome.runtime.sendMessage({ message: "capture_stopped", data: recordedChunks})
}

function stopCapture () {
  recorder.stop()
}

function resetRecorder () {
  console.log("stopping")
  recorder.stop()
}

function changeRecordingState() {
  chrome.storage.local.set({
    recording: false
  }, () => {
    console.log("Recording state changed from recorder.js")
  })
}

function downloadProcessed(data) {
  console.log("Downloading...")
  const url = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = outputFilename;
  link.click();
  URL.revokeObjectURL(url);
//sendRecordedChunks()
}

function downloadRaw() {
  console.log("Downloading...")
  const blob = new Blob(recordedChunks)
  const link = document.createElement("a");
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


