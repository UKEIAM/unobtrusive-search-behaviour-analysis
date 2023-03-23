    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === 'downloadRawData') {
                downloadJSON()
            }
            if (request.message === 'downloadWebVTT') {
                downloadWebVTT()
            }
    })


    async function downloadJSON() {
        console.log('JSON Download entered')
        const timeStamp = await chrome.storage.local.get(['initialTimeStamp'])
        const rawJSON = await chrome.storage.local.get(['rawJSON'])
        console.log('WebVTT downloader: ')
        const obj = JSON.stringify(resp.rawJSON);
        const blob = new Blob([obj], {type : 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = "none";
        link.href = url;
        link.download = `raw_json_${timeStamp.initialTimeStamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    async function downloadWebVTT() {
        console.log('WebVTT Download entered')
        const timeStamp = await chrome.storage.local.get(['initialTimeStamp'])
        const resp = await chrome.storage.local.get(['webVTT'])
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
    }
