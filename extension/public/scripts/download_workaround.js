chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === 'download') {
            console.log("Hi")
            download(request.data)
        }
})


function download(data) {
    console.log("Downloading...")
            items = data
            items.forEach((item) =>{
                file = JSON.stringify(item)
                let blob = new Blob([file], {type : 'application/json'});
                let url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.style.display = "none";
                link.h = url;
                link.download = `item.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link)
                URL.revokeObjectURL(url);
            })
}