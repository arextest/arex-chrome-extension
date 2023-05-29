// 类型定义
import base64ToFile from './utils/base64ToFile';
import {handleCookie, handleResHeaders, isJSONString, Payload as OldPayload} from './old/utils.ts'
interface SendResponse {
    headers: { key: string; value: string }[];
    data: any;
    status: number;
}
enum MethodEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}
interface Message {
    type: string;
    tid: string;
    payload: Payload;
}
interface Payload {
    url: string;
    method: MethodEnum;
    body: string;
    headers: Record<string, string>;
}
async function coreFetch(payload: Payload): Promise<SendResponse> {
    console.log(payload,'payload')
    // 先申明一个body变量
    let body: any = null;
    let headers = {};
    const {
        url,
        headers: payloadHeaders,
        method,
        body: payloadBodyString,
    } = payload;
    const contentType =
        payloadHeaders['content-type'] ||
        payloadHeaders['Content-Type'] ||
        undefined;
    if (contentType === 'application/json'||payloadBodyString === null) {
        body = payloadBodyString;
        headers = payloadHeaders;
    } else if (contentType === 'multipart/form-data') {
        delete payloadHeaders['content-type'];
        headers = payloadHeaders;
        // 如果是一个formData时，body是一个jsonstring，并且value会被base64过，形如[{key,value,type:'file'?}]
        const fd = new FormData();
        const payloadBody = JSON.parse(payloadBodyString);
        payloadBody.forEach((i: any) => {
            if (i.type === 'file') {
                fd.append(i.key, base64ToFile(i.value, i.filename));
            } else {
                fd.append(i.key, i.value);
            }
        });
        body = fd;
    }else if (contentType === undefined&&!['GET','HEAD','DELETE'].includes(method)){
        // 'GET','HEAD','DELETE'不支持body
        body = base64ToFile(payloadBodyString, '')
    }

    const fetchResponse = await fetch(url, {
        method,
        body,
        headers,
    })
    const responseHeaders:any = []
    fetchResponse.headers.forEach((v,k)=>{
        responseHeaders.push({key:k,value:v})
    })
    return {
        data: await fetchResponse.text(),
        headers: responseHeaders,
        status: fetchResponse.status,
    };
}
// 监听content script发送来的数据
chrome.runtime.onMessage.addListener(
     (
        message: Message,
        sender,
        sendResponse: (response: SendResponse) => void,
    ) => {
         console.log(sender)
         const cookieArr = handleCookie(message.payload.headers.cookie||message.payload.headers.Cookie,message.payload.url)
         // @ts-ignore
         if (message.v === '0.3.0'){
             Promise.all(cookieArr.map(i=>{
                 try {
                     chrome.cookies.set(i)
                 } catch (e) {
                     console.log(e)
                 }
             })).then(()=>{
                 coreFetch(message.payload).then(({ data, headers, status })=>{
                     sendResponse({ data, headers, status });
                 });
             })
         } else {
             const {url,requestInit} = new OldPayload(message.payload).getUrlAndRequestInit()
             Promise.all(cookieArr.map(i=>{
                 try {
                     chrome.cookies.set(i)
                 } catch (e) {
                     console.log(e)
                 }
             })).then(async (_) => {
                 try {
                     const response = await fetch(url,requestInit)
                     const headers = handleResHeaders(response.headers)
                     const status = response.status

                     // @ts-ignore
                     if (OldPayload.isBase64(message.payload.data||'')){
                         const data = await response.blob()
                         const base64Data = await OldPayload.blobToBase64(data)
                         sendResponse({
                             data:base64Data,
                             status,
                             headers
                         })
                     } else {
                         const data = await response.text()
                         if (isJSONString(data)){
                             sendResponse({
                                 data:JSON.parse(data),
                                 status,
                                 headers
                             })
                         } else {
                             sendResponse({
                                 data:data,
                                 status,
                                 headers
                             })
                         }

                     }
                 } catch (err:any) {
                     if (err.message && err.name) {
                         sendResponse({
                             // @ts-ignore
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
         }
        return true;
    },
);
