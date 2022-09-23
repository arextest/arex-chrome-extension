declare global {
    interface Window {
        __bfi: any
        __tfc: any
        version: any
    }
    var __ENV__: string
    var __SCOPE__: string
    var tealiumInfo:any
}

type Fn = (param: any) => void

export enum Cheaper {
    cheap = 1,
    same = 0,
    expensive = -1
}
