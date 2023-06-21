/// <reference types="chrome" />

// Define the tab data structure
interface TabData {
  observerState: boolean;
  urls: UrlsType;
}

// Define the URL types
type UrlsType = {
  images: string[];
  audio: string[];
  video: string[];
  text: string[];
  code: string[];
  other: string[];
  domains: string[];
};

// Initialize the tab data object
let tabData: Record<number, TabData> = {};

// Set up context menu at install time
chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item for images
  chrome.contextMenus.create({
    title: "Check if trained",
    contexts: ["image"],
    id: "contextImage",
  });
});

// Update the tab data when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
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
        },
      };
    } else {
      tabData[tabId].observerState = true;
    }
  }
});

// Handle context menu click events
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function
function onClickHandler(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
): void {
  if (tab && info.menuItemId === "contextImage" && info.mediaType === "image") {
    const imageLink = encodeURIComponent(info.srcUrl as string);
    const newUrl = `https://haveibeentrained.com?url=${imageLink}`;

    // Create a new tab with the new URL
    chrome.tabs.create({ url: newUrl });
  }
}

// Determine the appropriate onClick action based on the manifest version
let onClickAction:
  | typeof chrome.action
  | typeof chrome.browserAction
  | undefined;
if (typeof chrome.action !== "undefined") {
  onClickAction = chrome.action; // for Manifest V3
} else if (typeof chrome.browserAction !== "undefined") {
  onClickAction = chrome.browserAction; // for Manifest V2
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.tsx: onMessage: request.message: " + request);
  if (request.message === "ping") {
    console.log("got ping dont worry");
    sendResponse({ message: "background_active" });
    return true; // will respond asynchronously
  }

  let tabId = sender.tab?.id || request.tabId;
  if (!tabId) {
    tabId = request.tabId;
    console.log("Error: tabId is undefined" + request.message);
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
      },
    };
  }

  if (request.message === "page_links" && request.urls) {
    tabData[tabId].urls = request.urls;
    sendResponse({ status: "received" });
    return true; // will respond asynchronously
  } else if (request.message === "get_links") {
    sendResponse({ urls: tabData[tabId].urls });
    return true; // will respond asynchronously
  } else if (request.message === "observer_disconnect") {
    console.log("DIOSCONNECTED");
    console.log("observer_disconnect " + tabId);
    tabData[tabId].observerState = false;
    sendResponse({ status: "observer_disconnected" });
    if (request.tabId !== undefined) {
      // Send the observer state tab ID to background.js
      chrome.runtime.sendMessage(
        { message: "observer_disconnect", tabId: request.tabId },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            // Handle the error here, e.g., retry sending the message after some time
          } else {
            // Handle the response here
          }
        }
      );
    }
  } else if (request.message === "get_observer_state") {
    if (request.tabId !== undefined) {
      console.log(
        "get observer state" +
          request.tabId +
          " " +
          tabData[request.tabId]?.observerState
      );
      sendResponse({ observerState: tabData[request.tabId]?.observerState });
    } else {
      console.error("Error: tabId is undefined");
    }
  }
  console.log(request);
  sendResponse({ message: "Unrecognized or unprocessable message" });
  return true; // respond asynchronously
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabData[tabId];
});
