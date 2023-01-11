// TODO: MediaRecorder API has to be triggered here
let recording = false;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "start_recording") {
      startRecording();
    } else if (request.message === "stop_recording") {
      stopRecording();
    }
  });

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