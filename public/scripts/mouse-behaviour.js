
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if(request.message === 'start_click_tracking') {
        startClickTracking()
      }
      if(request.message === 'stop_click_tracking') {
        stopClickTracking()
      }
    }
)

<<<<<<< HEAD
function startClickTracking() {
    const clickEvent = (event) => {
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
    document.addEventListener("click", clickEvent)

    const contextMenuEvent = (event) => {
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
    }
    document.addEventListener("contextmenu", contextMenuEvent)

    const auxClickEvent = (event) => {
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
    }
    document.addEventListener("auxclick", auxClickEvent)
    }   
}

function stopClickTracking() {
    document.removeEventListener('click', clickEvent)
    document.removeEventListener('contextmenu', contextMenuEvent)
    document.removeEventListener('auxclick', auxClickEvent)
=======
function onClick(event) {
    var date = new Date();
    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds()
    var milliseconds = date.getMilliseconds()
    let click_data = {
        click: 'left-click',
        tag: event.target.localName,
        domElementMeta: {
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
}

function onContextMenu(event) {
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
}

function onAuxClick(event) {
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
}


function startClickTracking() {
    document.addEventListener("click", onClick)
    document.addEventListener("contextmenu", onContextMenu)
    document.addEventListener("auxclick", onAuxClick)
}

function stopClickTracking() {
    document.removeEventListener('click', onClick)
    document.removeEventListener('contextmenu', onContextMenu)
    document.removeEventListener('auxclick', onAuxClick)
>>>>>>> origin/master
}
