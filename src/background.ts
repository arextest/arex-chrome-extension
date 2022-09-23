import axios from 'redaxios';

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const payload = req.payload
    const cookieArr = handleCookie(payload.headers.cookie||payload.headers.Cookie,payload.url)
    Promise.all(cookieArr.map(i=>chrome.cookies.set(i))).then(r => {
        axios(payload).then(r => {
            sendResponse(r)
        }).catch(err => {
            if (err.message && err.name) {
                sendResponse({
                    type: 'error',
                    cause: err.cause,
                    message: err.message,
                    name: err.name,
                    stack: err.stack
                })
            } else {
                sendResponse(err)
            }
        })
    })


    return true
})

function cookieToJson(ck) {
    let cookieArr = ck.split(';')
    let obj = {}
    cookieArr.forEach((i) => {
        let arr = i.split("=");
        obj[arr[0]] = arr[1];
    });
    return obj
}

function handleCookie(cookie,url) {
    try {
        const j = cookieToJson(cookie.replace(/\s+/g,''))
        return Object.keys(j).map(k => {
            return ({
                url: url,
                name: k,
                value: j[k],
                path: '/'
            })
        })
    } catch (e) {
        return []
    }
}
