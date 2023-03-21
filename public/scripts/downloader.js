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
        chrome.storage.local.get(['initialTimeStamp']).then((timeStamp) => {
            chrome.storage.local.get(['rawJSON']).then((resp) => {
                if (resp && resp.rawJSON) {
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
                else {
                    console.log('rawJSON not loaded properly (again)')
                }
            })
        })
    }

    async function downloadWebVTT() {
        console.log('WebVTT Download entered')
        chrome.storage.local.get(['initialTimeStamp']).then((timeStamp) => {
            chrome.storage.local.get(['webVTT']).then((resp) => {
                if (resp && resp.webVTT) {
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
                else {
                    console.log('webVTT not loaded properly (again)')
                }
            })
        })
    }

