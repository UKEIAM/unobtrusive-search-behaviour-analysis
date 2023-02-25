

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.message === 'transcode') {
        console.log('Transcoding started')
        startTranscoding(request.data)
      }
    }
)
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({
  log: true,
  corePath: chrome.runtime.getURL('vendor/ffmpeg-core.js'),
});

async function startTranscoding(webVTT) {
    console.log(webVTT)
    const recordedChunks = await chrome.storage.local.get(['recordedChunks'])
    const label = await chrome.storage.local.get(['label'])
    const timeStamp = new Date()

    // Run FFmpeg to embed the subtitles in the video
    const outputFilename = `usba_${timeStamp}_${label}.mp4`;

    // Read the recordedChunks from chrome storage as a Blob
    console.log("Debugging: Before Blob creation")
    const recordedChunksBlob = new Blob([recordedChunks.recordedChunks], { type: 'video/webm' });
    console.log("Debugging: After Blob creation")
    // Convert the Blob to a Uint8Array
    const recordedChunksArray = new Uint8Array(await recordedChunksBlob.arrayBuffer());

    // TODO This one fails with issue recarding CSP
    if (! ffmpeg.isLoaded()){
        await ffmpeg.load();
      }
    console.log("Loaded ffmpeg")
    ffmpeg.FS('writeFile', outputFilename, await fetchFile(file));
    await ffmpeg.run("-i", recordedChunksArray, "-i", "data:text/vtt;base64," + Buffer.toString(String, webVTT), "-c", "copy", outputFilename);

    // Download the output file
    const finalRecording = ffmpeg.FS("readFile", outputFilename);

    console.log("Downloading...")
    const url = URL.createObjectURL(new Blob([finalRecording.buffer], { type: "video/mp4" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = outputFilename;
    link.click();
    URL.revokeObjectURL(url);
}