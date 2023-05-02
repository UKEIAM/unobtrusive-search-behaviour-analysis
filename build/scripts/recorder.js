chrome.runtime.onMessage.addListener(
  async function(request, sender, sendResponse) {
    if(request.message === "reset") {
      console.log("Stopped screen capturing")
      cancelled = true
      stopCapture()
    }
    if(request.message === "start") {
      startCapture()
    }
    if(request.message === "stop") {
      console.log("Stopped screen capturing")
      stopCapture()
    }
    if(request.message === "downloadRawRec") {
      await chrome.storage.local.get(['label']).then((resp) => {
        label = resp.label
      })
      await chrome.storage.local.get(['initialTimeStamp']).then((resp) => {
        initialTimeStamp = resp.initialTimeStamp
      })
      await chrome.storage.local.get(['duration']).then((resp) => {
        duration = resp.duration
      })
      downloadRaw()
    }
  }
)

let cancelled = false
let timeStamp = Date.now()

const displayMediaOptions = {
  video: {
    displaySurface: "monitor",
    frameRate: 10.0
  },
  audio: false
};

let recorder
let recordedChunks = [];
let stream;
let duration;
let initialTimeStamp;
let label;
let sharedDisplayId;

function handleBeforeUnload(event) {
  event.returnValue = "";
}


function startCapture() {
  window.addEventListener("beforeunload", handleBeforeUnload);
  const links = document.querySelectorAll('a');
  const forms = document.querySelectorAll('form');

  links.forEach(link => {
    link.setAttribute('target', '_blank');
  });

  forms.forEach(form => {
    form.setAttribute('target', '_blank')
  })

  navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    .then((stream) => {
      // Save the stream
      window.stream = stream;

      // Create a new MediaRecorder object
      const options = { mimeType: 'video/webm; codecs="vp8"' };
      recorder = new MediaRecorder(stream, options);

      // Start recording
      let initialTimeStamp = null;
      recorder.ondataavailable = (e) => {
        recordedChunks.push(e.data);
      };
      recorder.onstart = () => {
        initialTimeStamp = Date.now();
        console.log(`Initial timestamp set: ${initialTimeStamp}`);
        chrome.storage.local.set({ initialTimeStamp });
      };
      recorder.onstop = () => {
        console.log('Stopped');
        changeRecordingState();
        window.removeEventListener("beforeunload", handleBeforeUnload);

        if (cancelled) {
          console.log(recorder.state);
        } else {
          const duration = (Date.now() - initialTimeStamp) / 1000;
          chrome.storage.local.set({
            triggerFeedback: true,
            recordedChunks,
            duration,
          });
        }
        // Stop the stream
        stream.getTracks().forEach((track) => track.stop());

        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(videoTrack => videoTrack.stop());
      };

      recorder.start();
    })
    .catch((error) => {
      console.error(`Error: ${error}`);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", unloadHandler);
      chrome.storage.local.set({ recording: false });
      chrome.runtime.sendMessage({ message: "rec_permission_denied" });
    });
}


function sendRecordedChunks () {
  chrome.runtime.sendMessage({ message: "capture_stopped", data: recordedChunks})
}

function stopCapture () {
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
  console.log("downloadRaw function entered: " + initialTimeStamp)
  if (recordedChunks.length > 0) {
    const blob = new Blob(recordedChunks)
    const video = URL.createObjectURL(blob);
    video.duration = duration
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = video;
    link.download = `recording_${initialTimeStamp}_${label}.webm`;
    link.click();
    URL.revokeObjectURL(video);
  }
}


