(()=>{"use strict";new Map;var e={images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]},r=null;function a(a){(a=a.split("?")[0]).match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico|tif|tiff|eps|ai|indd|heif|raw|psd|cr2|nef|orf|sr2)$/i)&&(null==r?void 0:r.images)?e.images.push(a):a.match(/\.(mp3|flac|wav|aac|ogg|oga|m4a|aac|aiff|amr|m4a|opus|wma|alac|dss|dvf|m4p|mmf|mpc|msv|ra|rm|tta|vox|weba)$/i)&&(null==r?void 0:r.audio)?e.audio.push(a):a.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|3gp|3g2|h264|m4v|mpg|mpeg|rm|swf|vob|mts|m2ts|ts|qt|yuv|rmvb|asf|amv|mpg2)$/i)&&(null==r?void 0:r.video)?e.video.push(a):a.match(/\.(txt|pdf|doc|docx|odt|rtf|tex|wks|wpd|wps|html|htm|md|odf|xls|xlsx|ppt|pptx|csv|xml|ods|xlr|pages|log|key|odp)$/i)&&(null==r?void 0:r.text)?e.text.push(a):a.match(/\.(py|js|java|c|cpp|cs|h|css|php|swift|go|rb|pl|sh|sql|xml|json|ts|jsx|vue|r|kt|dart|rs|lua|asm|bash|erl|hs|vbs|bat|f|lisp|scala|groovy|ps1)$/i)&&(null==r?void 0:r.code)?e.code.push(a):e.other.push(a);var t=function(e){return(e.indexOf("://")>-1?e.split("/")[2]:e.split("/")[0]).split(":")[0]}(a);t&&!e.domains.includes(t)&&e.domains.push(t),chrome.runtime.sendMessage({message:"page_links",urls:e})}chrome.storage.sync.get({images:!0,audio:!0,video:!0,text:!0,code:!0},(function(e){r=e})),chrome.runtime.onMessage.addListener((function(r,t,s){var o;console.log("Received message for tabId:",r.tabId);var n=(null===(o=t.tab)||void 0===o?void 0:o.id)||r.tabId;if("start_scraping"===r.message){e={images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]};var c=null,i=new MutationObserver((function(e){c&&clearTimeout(c);for(var t=0,s=e;t<s.length;t++){var o=s[t];if("childList"===o.type)for(var d=0,m=Array.from(o.addedNodes);d<m.length;d++){var l=m[d];if(l.nodeType===Node.ELEMENT_NODE){for(var v=l,g=0,f=["img","video","audio","a","link","script","source"];g<f.length;g++)for(var u=f[g],h=v.getElementsByTagName(u),p=0,b=Array.from(h);p<b.length;p++){var y=b[p];(y.src||y.href||y.data)&&a(y.src||y.href||y.data)}(v.src||v.href||v.data)&&a(v.src||v.href||v.data)}}}c=setTimeout((function(){i.disconnect(),chrome.runtime.sendMessage({message:"observer_disconnect",tabId:n}),console.log("Observer disconnected for tabId:",r.tabId),console.log("Mutation observer disconnected due to inactivity")}),2e3)}));i.observe(document,{attributes:!1,childList:!0,subtree:!0}),console.log("Mutation observer started for tabId:",r.tabId);var d=0,m=setInterval((function(){var a=Object.values(e).reduce((function(e,r){return e+r.length}),0);a===d&&(i.disconnect(),chrome.runtime.sendMessage({message:"observer_disconnect",tabId:n}),console.log("Observer disconnected for tabId:",r.tabId),clearInterval(m)),d=a}),1500);!function(){for(var e=Array.from(document.getElementsByTagName("img")),r=Array.from(document.getElementsByTagName("video")),t=Array.from(document.getElementsByTagName("audio")),s=Array.from(document.getElementsByTagName("a")),o=Array.from(document.getElementsByTagName("link")),n=Array.from(document.getElementsByTagName("script")),c=0,i=e;c<i.length;c++){var d=i[c];d.src&&a(d.src)}for(var m=0,l=r;m<l.length;m++){var v=l[m];v.src&&a(v.src);for(var g=0,f=Array.from(v.getElementsByTagName("source"));g<f.length;g++)(x=f[g]).src&&a(x.src)}for(var u=0,h=t;u<h.length;u++){var p=h[u];p.src&&a(p.src);for(var b=0,y=Array.from(p.getElementsByTagName("source"));b<y.length;b++){var x;(x=y[b]).src&&a(x.src)}}for(var I=0,w=s;I<w.length;I++){var E=w[I];E.href&&a(E.href)}for(var N=0,T=o;N<T.length;N++){var A=T[N];A.href&&a(A.href)}for(var B=0,M=n;B<M.length;B++){var j=M[B];j.src&&a(j.src)}}(),s({success:!0,tabId:r.tabId})}}))})();