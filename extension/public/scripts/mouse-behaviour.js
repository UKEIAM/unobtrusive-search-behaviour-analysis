
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.message === 'start_click_tracking') {
        console.log('Clicks script started')
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
            timeStampVTT: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            timeStamp: date.getTime(),
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds
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
            timeStamp: date.getTime(),
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds
        }
        chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
    })

    document.addEventListener("auxclick", (event) => {
        var date = new Date();
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
            timeStamp: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
            timeStampMili: date.getTime(),
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            milliseconds: milliseconds
        }

        chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })

        // let click_data = {
        //     tag: event.target.localName,
        //     domElementMeta: {
        //         outerText: event.target.outerText,
        //         outerHTML: event.target.outerHTML,
        //         innerText: event.target.innerText,
        //         innerHTML: event.target.innerHTML,
        //         ownerDocument: event.target.ownerDocument.location,
        //         URL: event.target.ownerDocument.URL
        //     },
        //     coordinates: {
        //         x: event.x,
        //         y: event.y
        //     },
        //     timeStampVTT: hours + ":" + minutes + ":" + seconds + "." + milliseconds,
        //     timeStamp: date.getTime(),
        //     hours: hours,
        //     minutes: minutes,
        //     seconds: seconds,
        //     milliseconds: milliseconds
        // }
        //chrome.runtime.sendMessage({ message: "click_tracked", data: click_data })
    })
}

function stopClickTracking() {
    document.removeEventListener('click', startClickTracking)
    document.removeEventListener('contextmenu', startClickTracking)
    document.removeEventListener('auxclick', startClickTracking)
}
