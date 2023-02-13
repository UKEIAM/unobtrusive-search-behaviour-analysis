console.log('Clicks script started')

document.addEventListener("click", (event) => {
    var date = new Date();

    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var milliseconds = date.getMilliseconds()

    let click_data = {
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
        timeStamp: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds
    }
    chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
})
