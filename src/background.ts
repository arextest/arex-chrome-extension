// 类型定义
import base64ToFile from './utils/base64ToFile';

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
    }else if (contentType === undefined){
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
        coreFetch(message.payload).then(({ data, headers, status })=>{
            sendResponse({ data, headers, status });
        });
        return true;
    },
);
