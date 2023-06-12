/// <reference types="chrome" />

let background_urls: UrlsType;

let observer_disconnect: boolean = false;

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'page_links' && request.urls) {
        background_urls = request.urls;
        sendResponse({ status: 'received' });
        return true; // will respond asynchronously
    } else if (request.message === 'ping') {
        sendResponse({ message: 'background_active' });
    } else if (request.message === 'get_links') {
        sendResponse({ urls: background_urls });
        return true; // will respond asynchronously
    } else if (request.message === 'observer_disconnect') {
        observer_disconnect = true;
        return true; // will respond asynchronously
    } else if (request.message === 'check_observer_disconnect') {
        return observer_disconnect; // will respond asynchronously
    }
    console.log(request);
});
