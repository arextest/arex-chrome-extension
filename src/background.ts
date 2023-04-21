function base64ToBinary(base64) {
    const raw = atob(base64);
    const binary = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
        binary[i] = raw.charCodeAt(i);
    }
    return binary;
}
function isBase64(str){
    if(str === '' || str.trim() === ''){
        return false;
    }
    try{
        return btoa(atob(str)) === str;
    }catch(err){
        return false;
    }
}
function handlePayload(payload) {
    if (isBase64(payload.data||'')){
        return {
            ...payload,
            body: base64ToBinary(payload.data),
        }
    } else {
        return {
            ...payload,
            body: payload.data
        }
    }
}
function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const payload = handlePayload(req.payload)
    const cookieArr = handleCookie(payload.headers.cookie||payload.headers.Cookie,payload.url)
    Promise.all(cookieArr.map(i=>{
        try {
            chrome.cookies.set(i)
        } catch (e) {
            console.log(e)
        }
    })).then(async (_) => {
        try {
            const response = await fetch(payload.url,payload)
            const headers = handleResHeaders(response.headers)
            const status = response.status
            if (isBase64(payload.data||'')){
                const data = await response.blob()
                const base64Data = await blobToBase64(data)
                sendResponse({
                    data:base64Data,
                    status,
                    headers
                })
            } else {
                const data = await response.text()
                sendResponse({
                    data:data,
                    status,
                    headers
                })
            }
        } catch (err) {
            if (err.message && err.name) {
                sendResponse({
                    type: 'error',
                    cause: err.cause,
                    message: err.message,
                    name: err.name,
                    stack: err.stack
                })
            } else {
                sendResponse({
                    data: err.data,
                    status: err.status,
                    headers: handleResHeaders(err.headers)
                })
            }
        }
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

function handleResHeaders(headers) {
    const newHeaders = []
    headers.forEach((v,k)=>{
        newHeaders.push({
            key:k,
            value:v
        })
    })
    return newHeaders
}
