
let recording = false

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Entered recorder")
        if (request.message === "start_recording") {
            startRecording();
        }
        if (request.message === "stop_recording") {
            recording = false;
            const url = URL.createObjectURL(screenBlob)
            sendResponse({url: url});
        }
    });

let recorder;
let recordedChunks;

function startRecording() {
    console.log('Initialising recorder')
    navigator.mediaDevices.getUserMedia({ screen: true }).then((stream) => {
      // Create a new MediaRecorder object
      console.log(MediaRecorder.state)
      const options = { mimeType: "video/webm; codecs=vp9" };
      recorder = new MediaRecorder(stream, options);

      // Start recording
      recorder.start();
      recording = true

      recordedChunks = []
      // Listen for the dataavailable event
      recorder.addEventListener('dataavailable', (event) => {
        // TODO: Case of handling file depending on the config.json
          // If config.json/ upload -> upload to server
          // Otherwise, download locally
          if (event.data.size  > 0) {
            recordedChunks.push(event.data)
          }
      });
  });
    console.log('Finished recording')
  }

  function stopRecording() {
    recorder.stop
    setTimeout(() => {
        const blob = new Blob(recordedChunks, {type: "video/webm"})
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'recording.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    })
  }