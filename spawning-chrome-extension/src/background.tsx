/// <reference types="chrome" />

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

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });
    }
});

chrome.runtime.onMessage.addListener((request: { message: string, urls?: UrlsType }, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    if (request.message === 'page_links' && request.urls) {
        urls = request.urls;
        sendResponse({ status: 'received' });
        return true; // will respond asynchronously
    } else if (request.message === 'get_links') {
        sendResponse({ urls: urls });
        return true; // will respond asynchronously
    }
});
