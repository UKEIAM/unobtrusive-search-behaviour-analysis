chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === 'downloadRawData') {
            downloadJSON()
        }
        if (request.message === 'downloadWebVTT') {
            downloadWebVTT()
        }
})



// TODO: Summarize all available data into one json before downloading?
async function downloadJSON() {
    const timeStamp = await chrome.storage.local.get(['initialTimeStamp'])
    await chrome.storage.local.get(['rawJSON']).then((resp) => {
        console.log(resp.rawJSON)
        obj = JSON.stringify(resp.rawJSON)
        let blob = new Blob([obj], {type : 'application/json'});
        let url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.download = `raw_json_${timeStamp.initialTimeStamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    })
}

async function downloadWebVTT() {
    const timeStamp = await chrome.storage.local.get(['initialTimeStamp'])
    await chrome.storage.local.get(['webVTT']).then((resp) => {
        console.log(resp.webVTT)
        const blob = new Blob([resp.webVTT], { type: 'text/plain' });
        let url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.download = `webVTT_${timeStamp.initialTimeStamp}.vtt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link)
        URL.revokeObjectURL(url);
    })
}

