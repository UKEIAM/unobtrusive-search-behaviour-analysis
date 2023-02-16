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
function downloadJSON(data) {
    const jsonRaw = undefined
    const webVTT = undefined
    chrome.storage.sync.get(['jsonRaw']).then((resp) => {
        jsonRaw = resp.jsonRaw
    })
    obj = JSON.parse(jsonRaw)
    console.log("Downloading...")
    let blob = new Blob([obj], {type : 'application/json'});
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = "none";
    link.href = url;
    link.download = `jsonRaw_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link)
    URL.revokeObjectURL(url);
}

function downloadWebVTT() {
    const webVTT = undefined
    chrome.storage.sync.get(['webVTT']).then((resp) => {
        webVTT = resp.webVTT
    })
    console.log("Downloading...")
    const blob = new Blob([content], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = "none";
    link.href = url;
    link.download = `webVTT_${Date.now()}.vtt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link)
    URL.revokeObjectURL(url);
}

