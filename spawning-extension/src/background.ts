let searchText = process.env.BACKGROUND_SEARCH_TEXT;
let searchUrl = process.env.BACKGROUND_SEARCH_URL;
let backgroundDebug = process.env.GLOBAL_DEBUG;
let isBackgroundDebugMode = true;

if (typeof backgroundDebug !== "undefined") {
  isBackgroundDebugMode = backgroundDebug.toLowerCase() === "true";
}

// Initialize the tab data object
let tabData: Record<number, TabData> = {};

// Set up context menu at install time
chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item for images
  chrome.contextMenus.create({
    title: searchText,
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
    const newUrl = `${searchUrl}?url=${imageLink}`;

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
  if (isBackgroundDebugMode) {
    console.log("background.tsx: onMessage: request.message: " + request);
  }
  if (request.message === "check_background_active") {
    if (isBackgroundDebugMode) {
      console.log("background_active");
    }
    sendResponse({ message: "background_active" });
    return true; // will respond asynchronously
  }

  let tabId = sender.tab?.id || request.tabId;
  if (!tabId) {
    tabId = request.tabId;
    if (isBackgroundDebugMode) {
      console.log("Error: tabId is undefined" + request.message);
    }
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
    if (isBackgroundDebugMode) {
      console.log("observer_disconnect " + tabId);
    }
    tabData[tabId].observerState = false;
    sendResponse({ status: "observer_disconnected" });
  } else if (request.message === "get_observer_state") {
    if (request.tabId !== undefined) {
      if (isBackgroundDebugMode) {
        console.log(
          "get observer state" +
            request.tabId +
            " " +
            tabData[request.tabId]?.observerState
        );
      }
      sendResponse({ observerState: tabData[request.tabId]?.observerState });
    } else {
      console.error("Error: tabId is undefined");
    }
  }
  if (isBackgroundDebugMode) {
    console.log(request);
  }
  sendResponse({ message: "Unrecognized or unprocessable message" });
  return true; // respond asynchronously
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabData[tabId];
});
