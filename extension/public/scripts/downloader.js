chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Message recieved: " + request.message)
        if (request.message === 'downloadRawData') {
            downloadJSON()
        }
        if (request.message === 'downloadWebVTT') {
            downloadWebVTT()
        }
})

// TODO: Summarize all available data into one json before downloading?
async function downloadJSON() {
    await chrome.storage.local.get(['rawJSON']).then((resp) => {
        obj = JSON.stringify(resp.rawJSON)
        console.log("Downloading...")
        let blob = new Blob([obj], {type : 'application/json'});
        let url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.download = `jsonRAW_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    })
}

async function downloadWebVTT() {
    await chrome.storage.local.get(['webVTT']).then((resp) => {
        console.log("Downloading...")
        const blob = new Blob([resp.webVTT], { type: 'text/plain' });
        let url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.download = `webVTT_${Date.now()}.vtt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    })
}

