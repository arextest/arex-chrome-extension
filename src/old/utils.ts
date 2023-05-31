// 1.0.62是还原到了老分支
export class Payload {
    constructor(payload:any) {
        this.payload = payload
    }
    payload:{
        url:string,
        method:string
        data:any
        headers:{key:string,value:string}[]
        params:{key:string,value:string}[]
    }
    base64ToBinary(base64:any) {
        const raw = atob(base64);
        const binary = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) {
            binary[i] = raw.charCodeAt(i);
        }
        return binary;
    }
    static blobToBase64(blob:any) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
    getUrlAndRequestInit():{url:string,requestInit:any}{
        return {
            url:this.handleUrl(this.payload.url,this.payload.params),
            requestInit:this.getRequestInit(this.payload)
        }
    }
    handleUrl(url:any,params:any){
        return url + Object.keys(params||{}).map(i=>({key:i,value:params[i]})).reduce((p:any,c:any)=>{return p+'&'+c.key+'='+c.value},'?')
    }
    getRequestInit(p:any){
        if (p.method === 'GET'){
            return {
                method:p.method,
                headers:p.headers
            }
        } else {
            return {
                method:p.method,
                headers:p.headers,
                body:this.handleData(p.data),
            }
        }
    }

    handleData(data:any) {
        if (Payload.isBase64(data||'')){
            return this.base64ToBinary(data)
        } else {
            return this.chulidata(data)
        }
    }
    chulidata(data: any) {
        if (typeof data === 'object') {
            return JSON.stringify(data);
        } else {
            return data;
        }
    }
    static isBase64(str:any){
        if(str === ''){
            return false;
        }
        try{
            return btoa(atob(str)) === str;
        }catch(err){
            return false;
        }
    }
}

export function isJSONString(str:string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


// @ts-ignore
export function cookieToJson(ck:any) {
    let cookieArr = ck.split(';')
    let obj = {}
    cookieArr.forEach((i:any) => {
        let arr = i.split("=");
        // @ts-ignore
        obj[arr[0]] = arr[1];
    });
    return obj
}
// @ts-ignore
export function handleCookie(cookie:any,url:any) {
    try {
        const j = cookieToJson(cookie.replace(/\s+/g,''))
        return Object.keys(j).map(k => {
            // @ts-ignore

            return ({
                url: url,
                name: k,
                // @ts-ignore
                value: j[k],
                path: '/'
            })
        })
    } catch (e) {
        return []
    }
}

// @ts-ignore
export function handleResHeaders(headers:any) {
    const newHeaders:any = []
    headers.forEach((v:any,k:any)=>{
        newHeaders.push({
            key:k,
            value:v
        })
    })
    return newHeaders
}
