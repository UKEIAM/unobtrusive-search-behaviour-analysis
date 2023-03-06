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
<<<<<<< HEAD
    if(request.message === "downloadRawRec"){
        downloadRaw()
      }
=======
    if(request.message === "downloadRawRec")
      downloadRaw()
>>>>>>> origin/working-prototype
  }
)

let cancelled = false
let timeStamp = Date.now()

const displayMediaOptions = {
  video: {
    displaySurface: "monitor",
    frameRate: 20.0
  },
  audio: false
};

let recorder
let recordedChunks = [];
let stream
let unloadConfirmed = false
let duration;
let initialTimeStamp;

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
    const options = { mimeType: 'video/webm; codecs="vp9"'};
    recorder = new MediaRecorder(stream, options);
    // Start recording
    recorder.ondataavailable = (e) => {
      recordedChunks.push(e.data)
    };
      initialTimeStamp = Date.now()
      console.log("Initial timestamp set: " + initialTimeStamp)
      chrome.storage.local.set({
          initialTimeStamp: initialTimeStamp,
      })
    recorder.start();
    recorder.onstop = (e) => {
      changeRecordingState()
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (cancelled){
        console.log(recorder.state)
      }
      else {
        duration = (Date.now() - initialTimeStamp) / 1000
        chrome.storage.local.set({
          triggerFeedback: true,
          recordedChunks: recordedChunks,
          duration: duration
        })
      }
    }
  }).catch((err) => {
    window.removeEventListener("beforeunload", handleBeforeUnload)
    window.removeEventListener("unload", unloadHandler)
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

<<<<<<< HEAD
async function downloadRaw(label) {
  console.log("Downloading...")
=======
async function downloadRaw() {
  const timeStamp = await chrome.storage.local.get(['initialTimeStamp'])
  const duration = await chrome.storage.local.get(['duration'])
>>>>>>> origin/working-prototype
  let label
  const resp = await chrome.storage.local.get(['label'])
  if (resp.label != undefined){
    label = resp.label
  }
  else {
    label  = 'unlabeled'
  }
<<<<<<< HEAD
=======
  console.log("downloadRaw function entered")
>>>>>>> origin/working-prototype
  const blob = new Blob(recordedChunks)
  const video = URL.createObjectURL(blob);
  video.duration = duration.duration
  const link = document.createElement("a");
  link.style.display = "none";
<<<<<<< HEAD
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `recording_${timeStamp}_ ${label}.webm`;
  document.body.appendChild(link);
=======
  link.href = video;
  link.download = `recording_${timeStamp.initialTimeStamp}_${label}.webm`;
>>>>>>> origin/working-prototype
  link.click();
  URL.revokeObjectURL(video);
}


