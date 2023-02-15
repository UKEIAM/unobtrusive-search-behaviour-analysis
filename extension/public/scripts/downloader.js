chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === 'downloadRawData') {
            download(request.data)
        }
})

// TODO: Summarize all available data into one json before downloading?
function download(data) {
    jsonRaw = undefined
    chrome.storage.sync.get(['jsonRaw']).then((resp) => {
        jsonRaw = resp.jsonRaw
    })
    obj = JSON.parse(jsonRaw)
    console.log("Downloading...")
    let blob = new Blob([obj], {type : 'application/json'});
    let url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = "none";
    link.h = url;
    link.download = `item.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link)
    URL.revokeObjectURL(url);
}