
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("Message recieved: " + request.message)
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

let recorder
let recordedChunks = [];
let stream
let unloadConfirmed = false

function handleBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = '';
  // Display a confirmation dialog
  const confirmationMessage = "Please keep the tab where recording has been started open. Data will be lost if you leave the page, are you sure?";
  event.returnValue = confirmationMessage;

  // Set the unloadConfirmed flag based on the user's response
  setTimeout(() => {
    if (unloadConfirmed === false) {
      unloadConfirmed = confirm(confirmationMessage);
    }
  }, 100);
}

function unloadHandler(event) {
  if (unloadConfirmed === true) {
    stopCapture()
    chrome.runtime.sendMessage({ message: "reset" })
    chrome.storage.local.set({
        userOptions: {
            screen: true,
            navigation: true,
            mouse: true,
        },
        recording: false,
      })
  }
}

function startCapture() {
  window.addEventListener("beforeunload", handleBeforeUnload)
  window.addEventListener("unload", unloadHandler)
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
    window.removeEventListener("beforeunload", handleBeforeUnload)
    window.removeEventListener("unload", )
    console.error(`Error:${err}`)
    chrome.storage.local.set({
      recording: false
    })
    chrome.runtime.sendMessage({ message: "rec_permission_denied" });
    return })
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

async function downloadRaw() {
  let label
  const resp = await chrome.storage.local.get(['label'])
  const resp2 = await chrome.storage.local.get(['initialTimeStamp'])
  if (resp.label != undefined){
    label = resp.label
  }
  else {
    label  = 'unlabeled'
  }
  console.log("Downloading...")
  const blob = new Blob(recordedChunks)
  const link = document.createElement("a");
  link.style.display = "none";
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `recording_${resp2.initialTimeStamp}_${label}.webm`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link)
  URL.revokeObjectURL(url);
}


