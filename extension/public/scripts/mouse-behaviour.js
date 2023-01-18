console.log('Clicks script started')
document.addEventListener("click", (event) => {
    var click_data = {
        domElement: {
            tag: event.target.localName,
            outerText: event.target.outerText,
            outerHTML: event.target.outerHTML,
            innerText: event.target.innerText,
            innerHTML: event.target.innerHTML,
            ownerDocument: event.target.ownerDocument.location,
            URL: event.target.ownerDocument.URL

        },
        coordinates: {
            x: event.x,
            y: event.y
        },
        timeStamp: event.timeStamp
    }
    chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
})