(()=>{"use strict";var e;e="true"==="true".toLowerCase();var o={};chrome.runtime.onInstalled.addListener((function(){chrome.contextMenus.create({title:"Image Search HiBT",contexts:["image"],id:"contextImage"})})),chrome.tabs.onUpdated.addListener((function(e,t,r){"complete"===t.status&&r.active&&(o[e]?o[e].observerState=!0:o[e]={observerState:!0,urls:{images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]}})})),chrome.contextMenus.onClicked.addListener((function(e,o){if(o&&"contextImage"===e.menuItemId&&"image"===e.mediaType){var t=encodeURIComponent(e.srcUrl),r="".concat("https://haveibeentrained.com","?url=").concat(t);chrome.tabs.create({url:r})}})),void 0!==chrome.action?chrome.action:void 0!==chrome.browserAction&&chrome.browserAction,chrome.runtime.onMessage.addListener((function(t,r,s){var a,n,c;if(e&&console.log("background.tsx: onMessage: request.message: "+t),"check_background_active"===t.message)return e&&console.log("background_active"),s({message:"background_active"}),!0;var d=(null===(a=r.tab)||void 0===a?void 0:a.id)||t.tabId;return d?(o[d]||(o[d]={observerState:!0,urls:{images:[],audio:[],video:[],text:[],code:[],other:[],domains:[]}}),"page_links"===t.message&&t.urls?(o[d].urls=t.urls,s({status:"received"}),!0):"get_links"===t.message?(s({urls:o[d].urls}),!0):("observer_disconnect"===t.message?(e&&console.log("observer_disconnect "+d),o[d].observerState=!1,s({status:"observer_disconnected"})):"get_observer_state"===t.message&&(void 0!==t.tabId?(e&&console.log("get observer state"+t.tabId+" "+(null===(n=o[t.tabId])||void 0===n?void 0:n.observerState)),s({observerState:null===(c=o[t.tabId])||void 0===c?void 0:c.observerState})):console.error("Error: tabId is undefined")),e&&console.log(t),s({message:"Unrecognized or unprocessable message"}),!0)):(d=t.tabId,e&&console.log("Error: tabId is undefined"+t.message),!0)})),chrome.tabs.onRemoved.addListener((function(e){delete o[e]}))})();