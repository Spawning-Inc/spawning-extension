(()=>{"use strict";var e,r;if(r="true"==="true".toLowerCase(),e=Number("3500"),isNaN(e))throw new Error("CONTENT_MUTATION_TIMEOUT should be a number");new Map;var a={images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]},t=null;function s(e){(e=e.split("?")[0]).match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico|tif|tiff|eps|ai|indd|heif|raw|psd|cr2|nef|orf|sr2)$/i)&&(null==t?void 0:t.images)?a.images.push(e):e.match(/\.(mp3|flac|wav|aac|ogg|oga|m4a|aac|aiff|amr|m4a|opus|wma|alac|dss|dvf|m4p|mmf|mpc|msv|ra|rm|tta|vox|weba)$/i)&&(null==t?void 0:t.audio)?a.audio.push(e):e.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|3gp|3g2|h264|m4v|mpg|mpeg|rm|swf|vob|mts|m2ts|ts|qt|yuv|rmvb|asf|amv|mpg2)$/i)&&(null==t?void 0:t.video)?a.video.push(e):e.match(/\.(txt|pdf|doc|docx|odt|rtf|tex|wks|wpd|wps|html|htm|md|odf|xls|xlsx|ppt|pptx|csv|xml|ods|xlr|pages|log|key|odp)$/i)&&(null==t?void 0:t.text)?a.text.push(e):e.match(/\.(py|js|java|c|cpp|cs|h|css|php|swift|go|rb|pl|sh|sql|xml|json|ts|jsx|vue|r|kt|dart|rs|lua|asm|bash|erl|hs|vbs|bat|f|lisp|scala|groovy|ps1)$/i)&&(null==t?void 0:t.code)?a.code.push(e):a.other.push(e);var r=function(e){return(e.indexOf("://")>-1?e.split("/")[2]:e.split("/")[0]).split(":")[0]}(e);r&&!a.domains.includes(r)&&a.domains.push(r),chrome.runtime.sendMessage({message:"page_links",urls:a})}chrome.storage.sync.get({images:!0,audio:!0,video:!0,text:!0,code:!0},(function(e){t=e})),chrome.runtime.onMessage.addListener((function(t,o,n){var m;r&&console.log("Received message for tabId:",t.tabId);var d=(null===(m=o.tab)||void 0===m?void 0:m.id)||t.tabId;if("start_scraping"===t.message){a={images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]};var i=new MutationObserver((function(a){for(var o=0,n=a;o<n.length;o++){var m=n[o];if("childList"===m.type)for(var c=0,l=Array.from(m.addedNodes);c<l.length;c++){var v=l[c];if(v.nodeType===Node.ELEMENT_NODE){for(var g=v,f=0,u=["img","video","audio","a","link","script","source"];f<u.length;f++)for(var h=u[f],p=g.getElementsByTagName(h),b=0,y=Array.from(p);b<y.length;b++){var N=y[b];(N.src||N.href||N.data)&&s(N.src||N.href||N.data)}(g.src||g.href||g.data)&&s(g.src||g.href||g.data)}}}setTimeout((function(){i.disconnect(),chrome.runtime.sendMessage({message:"observer_disconnect",tabId:d}),r&&console.log("Observer disconnected for tabId:",t.tabId)}),e)}));i.observe(document,{attributes:!1,childList:!0,subtree:!0}),r&&console.log("Mutation observer started for tabId:",t.tabId);var c=0,l=setInterval((function(){var e=Object.values(a).reduce((function(e,r){return e+r.length}),0);e===c&&(i.disconnect(),chrome.runtime.sendMessage({message:"observer_disconnect",tabId:d}),r&&console.log("Observer disconnected for tabId:",t.tabId),clearInterval(l)),c=e}),e);!function(){for(var e=Array.from(document.getElementsByTagName("img")),r=Array.from(document.getElementsByTagName("video")),a=Array.from(document.getElementsByTagName("audio")),t=Array.from(document.getElementsByTagName("a")),o=Array.from(document.getElementsByTagName("link")),n=Array.from(document.getElementsByTagName("script")),m=0,d=e;m<d.length;m++){var i=d[m];i.src&&s(i.src)}for(var c=0,l=r;c<l.length;c++){var v=l[c];v.src&&s(v.src);for(var g=0,f=Array.from(v.getElementsByTagName("source"));g<f.length;g++)(N=f[g]).src&&s(N.src)}for(var u=0,h=a;u<h.length;u++){var p=h[u];p.src&&s(p.src);for(var b=0,y=Array.from(p.getElementsByTagName("source"));b<y.length;b++){var N;(N=y[b]).src&&s(N.src)}}for(var x=0,T=t;x<T.length;x++){var w=T[x];w.href&&s(w.href)}for(var I=0,E=o;I<E.length;I++){var A=E[I];A.href&&s(A.href)}for(var M=0,B=n;M<B.length;M++){var O=B[M];O.src&&s(O.src)}}(),n({success:!0,tabId:t.tabId})}}))})();