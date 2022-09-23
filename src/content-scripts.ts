const executeJS = function () {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.className = 'content_scripts';
    script.src = chrome.runtime.getURL('interceptor.js');
    const parent = document.head || document.documentElement;
    parent.appendChild(script);
};
executeJS();

window.addEventListener("message", (ev) => {
    if (ev.data.type === "__AREX_EXTENSION_REQUEST__"){
        chrome.runtime.sendMessage(ev.data, res => {
            window.postMessage(
                {
                    type: "__AREX_EXTENSION_RES__",
                    res,
                    tid:ev.data.tid
                },
                "*"
            )
        })
    }
})
