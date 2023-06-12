/// <reference types="chrome" />

let tabData: Record<number, { observerState: boolean; urls: UrlsType }> = {};

let observerState = true; // Add this state

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    console.log('background.tsx: onMessage: request.message: ' + request);
    if (request.message === 'ping') {
        console.log('got ping dont worry');
        sendResponse({ message: 'background_active' });
        return true; // will respond asynchronously
    }

    let tabId = sender.tab?.id || request.tabId;
    if (!tabId) {
        tabId = request.tabId;
        console.log('Error: tabId is undefined' + request.message);
        return true;
    }

    // Initialize data for new tab
    if (!tabData[tabId]) {
        tabData[tabId] = {
            observerState: true,
            urls: {
                images: [],
                audio: [],
                video: [],
                text: [],
                code: [],
                other: [],
                domains: [],
            }
        };
    }

    if (request.message === 'page_links' && request.urls) {
        tabData[tabId].urls = request.urls;
        sendResponse({ status: 'received' });
        return true; // will respond asynchronously
    } else if (request.message === 'get_links') {
        sendResponse({ urls: tabData[tabId].urls });
        return true; // will respond asynchronously
    } else if (request.message === 'observer_disconnect') {
        console.log('DIOSCONNECTED');
        console.log('observer_disconnect ' + tabId);
        tabData[tabId].observerState = false;
        sendResponse({ status: 'observer_disconnected' });
        if (request.tabId !== undefined) {
            // Send the observer state tab ID to background.js
            chrome.runtime.sendMessage({ message: 'observer_disconnect', tabId: request.tabId });
        }
    } else if (request.message === 'get_observer_state') {
        if (request.tabId !== undefined) {
            console.log('get observer state' + request.tabId + ' ' + tabData[request.tabId]?.observerState)
            sendResponse({ observerState: tabData[request.tabId]?.observerState });
        } else {
            console.error('Error: tabId is undefined');
        }
    }
    console.log(request);
    sendResponse({ message: 'Unrecognized or unprocessable message' });
    return true; // respond asynchronously
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabData[tabId];
});