
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.message === 'start_click_tracking') {
        startClickTracking()
      }
      if(request.message === 'stop_click_tracking') {
        console.log('Stopping click tracking')
        stopClickTracking()
      }
    }
)

function startClickTracking() {
    document.addEventListener("click", (event) => {
        var date = new Date();
        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds()
        var milliseconds = date.getMilliseconds()
        let click_data = {
            click: 'left-click',
            tag: event.target.localName,
            domElementMeta: {
                // innerHTML: event.target.innerHTML,
                ownerDocument: event.target.ownerDocument.location,
                URL: event.target.ownerDocument.URL
            },
            coordinates: {
                x: event.x,
                y: event.y
            },
            timeStampVTT: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            timeStamp: Date.now()
        }
        chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
    })
    document.addEventListener("contextmenu", (event) => {
        var date = new Date();
        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds()
        var milliseconds = date.getMilliseconds()
        let click_data = {
            click: 'right-click',
            meta: {
                pointerType: event.target.pointerType,
                type: event.target.type,
            },
            coordinates: {
                x: event.x,
                y: event.y
            },
            timeStampVTT: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            timeStamp: Date.now()
        }
        chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
    })

    document.addEventListener("auxclick", (event) => {
        var date = new Date()
        var hours = date.getHours()
        var minutes = date.getMinutes()
        var seconds = date.getSeconds()
        var milliseconds = date.getMilliseconds()
        let click_data = {
            click: 'wheel-click',
            meta: {
                pointerType: event.target.pointerType,
                type: event.target.type,
            },
            coordinates: {
                x: event.x,
                y: event.y
            },
            timeStampVTT: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            timeStamp: Date.now()
        }
        chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
    })
}

function stopClickTracking() {
    document.removeEventListener('click', startClickTracking)
    document.removeEventListener('contextmenu', startClickTracking)
    document.removeEventListener('auxclick', startClickTracking)
}