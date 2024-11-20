"use strict";var c="version-web-update-notify";var s="webupdatenotify",d="plugin-web-update-notify";var a=document.querySelector(`.${d}`);a==null||a.addEventListener("click",()=>window.location.reload());function r(n){let t=()=>{window.fetch(`/static/${c}.json?t=${Date.now()}`).then(e=>{if(!e.ok)throw new Error(`Failed to fetch ${c}.json`);return e.json()}).then(e=>{window.webUpdateNotifyVersion!==e.version&&(document.body.dispatchEvent(new CustomEvent(s,{detail:n,bubbles:!0})),!window.hasShowSystemUpdateNotice_plugin&&!n.hiddenDefaultNotify&&w(n))}).catch(e=>{console.error("\u68C0\u67E5\u7CFB\u7EDF\u66F4\u65B0\u5931\u8D25\uFF1A",e)})};t(),setInterval(t,n.checkInterval||10*60*1e3),window.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&t()}),window.addEventListener("error",e=>{var i;((i=e==null?void 0:e.target)==null?void 0:i.tagName)==="SCRIPT"&&t()},!0)}window.webUpdateCheck_checkAndNotice=r;function w(n){window.hasShowSystemUpdateNotice_plugin=!0;let{notifyProps:t,customNotifyHTML:e}=n,o=document.createElement("div"),i="";if(e)i=e;else{let l=(t==null?void 0:t.title)||"\u{1F4E2} &nbsp;\u7CFB\u7EDF\u5347\u7EA7\u901A\u77E5",u=(t==null?void 0:t.description)||"\u68C0\u6D4B\u5230\u5F53\u524D\u7CFB\u7EDF\u7248\u672C\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u4F7F\u7528\u3002",p=(t==null?void 0:t.buttonText)||"\u5237\u65B0";o.classList.add("plugin-web-update-notify-box"),i=`
    <div class="plugin-web-update-notify-content" data-cy="notify-content">
      <div class="plugin-web-update-notify-content-title">
        ${l}
      </div>
      <div class="plugin-web-update-notify-content-desc">
        ${u}
      </div>
      <a href="javascript:location.reload()" class="plugin-web-update-notify-content-btn">
        ${p}
      </a>
    </div>`}o.innerHTML=i,document.querySelector(`.${d}`).appendChild(o)}export{r as webUpdateCheck_checkAndNotice,w as webUpdateCheck_showNotify};
//# sourceMappingURL=plugin-web-update-notify.js.map
        window.webUpdateNotifyVersion = "73f568e";
        webUpdateCheck_checkAndNotice({"logVersion":true,"checkInterval":30000});