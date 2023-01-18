let recorder;
let recordedChunks;

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
        const screenBlob = event.data
        const url = URL.createObjectURL(screenBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'recording.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    });

    setTimeout(() => {
        recorder.stop();
    }, 1000);
});
