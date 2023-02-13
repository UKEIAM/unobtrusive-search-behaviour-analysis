console.log('Clicks script started')
const dateVTT = chrome.store.sync.get('startTimeStamp')

document.addEventListener("click", (event) => {
    var date = new Date();

    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var milliseconds = date.getMilliseconds()

    var hoursVTT = date.getHours() - dateVTT.getHours()
    var minutesVTT = (date.getMinutes() - dateVTT.getMinutes()) < 0 ? '00' : date.getMinutes() - dateVTT.getMinutes()
    var secondsVTT = (date.getSeconds() - dateVTT.getSeconds()) < 0 ? '00' : date.getSeconds() - dateVTT.getSeconds()
    var millisecondsVTT = (date.getMilliseconds() - dateVTT.getMilliseconds()) < 0 ? '000' : date.getMilliseconds() - dateVTT.getMilliseconds()

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
        timeStampVTT: hoursVTT + ":" + minutesVTT + ":" + secondsVTT + "." + millisecondsVTT,
    }
    chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
})