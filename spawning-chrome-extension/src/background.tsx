/// <reference types="chrome" />

let background_urls: UrlsType;

let onClickAction: typeof chrome.action | typeof chrome.browserAction | undefined;

type UrlsType = {
    images: string[];
    audio: string[];
    video: string[];
    text: string[];
    code: string[];
    other: string[];
    domains: string[];
};

// Set up context menu at install time.
chrome.runtime.onInstalled.addListener(() => {
    // Create one item for each context type.
    chrome.contextMenus.create({
        "title": "Check if trained",
        "contexts": ["image"],
        "id": "contextImage"
    });
});

// Add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): void {
    if (tab && info.menuItemId === "contextImage" && info.mediaType === "image") {
        const imageLink = encodeURIComponent(info.srcUrl as string);
        const newUrl = `https://haveibeentrained.com?url=${imageLink}`;

        // Create a new tab with the new URL
        chrome.tabs.create({ url: newUrl });
    }
}

if (typeof chrome.action !== 'undefined') {
    onClickAction = chrome.action; // for Manifest V3
} else if (typeof chrome.browserAction !== 'undefined') {
    onClickAction = chrome.browserAction; // for Manifest V2
}

if (onClickAction) {
    onClickAction.onClicked.addListener((tab) => {
        if (tab.id) {
            chrome.tabs.executeScript(tab.id, {
                file: "content.js"
            }, () => {
                let checkIfLoaded = setInterval(() => {
                    if (isContentScriptReady) {
                        clearInterval(checkIfLoaded);
                        // Now it's safe to send messages to content.js
                    }
                }, 100);
            });
        }
    });
}

let isContentScriptReady = false;


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'content_ready') {
        isContentScriptReady = true;
    }
    chrome.runtime.onMessage.addListener((request: { message: string, urls?: UrlsType }, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        if (request.message === 'page_links' && request.urls) {
            background_urls = request.urls;
            sendResponse({ status: 'received' });
            return true; // will respond asynchronously
        } else if (request.message === 'get_links') {
            sendResponse({ urls: background_urls });
            return true; // will respond asynchronously
        }
    });
});

chrome.runtime.onStartup.addListener(() => {
    // Send a message to the extension indicating that background.js is ready
    chrome.runtime.sendMessage({ type: "background_ready" });
});
