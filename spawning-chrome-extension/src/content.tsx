/// <reference types="chrome" />

let urls: UrlsType = {
    images: [],
    audio: [],
    video: [],
    text: [],
    code: [],
    other: [],
    domains: [],
};

type SettingsType = {
    images?: boolean;
    audio?: boolean;
    video?: boolean;
    text?: boolean;
    code?: boolean;
    [key: string]: any;
} | null;

let settings: SettingsType = null;

chrome.storage.sync.get(
    { images: true, audio: true, video: true, text: true, code: true },
    (items: SettingsType) => {
        settings = items;
    }
);

function classifyUrl(url: string): void {
    url = url.split('?')[0]; // Remove query string
    if (url.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp|ico|tif|tiff|eps|ai|indd|heif|raw|psd|cr2|nef|orf|sr2)$/i) && settings?.images) {
        urls['images'].push(url);
    } else if (url.match(/\.(mp3|flac|wav|aac|ogg|oga|m4a|aac|aiff|amr|m4a|opus|wma|alac|dss|dvf|m4p|mmf|mpc|msv|ra|rm|tta|vox|weba)$/i) && settings?.audio) {
        urls['audio'].push(url);
    } else if (url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|3gp|3g2|h264|m4v|mpg|mpeg|rm|swf|vob|mts|m2ts|ts|qt|yuv|rmvb|asf|amv|mpg2)$/i) && settings?.video) {
        urls['video'].push(url);
    } else if (url.match(/\.(txt|pdf|doc|docx|odt|rtf|tex|wks|wpd|wps|html|htm|md|odf|xls|xlsx|ppt|pptx|csv|xml|ods|xlr|pages|log|key|odp)$/i) && settings?.text) {
        urls['text'].push(url);
    } else if (url.match(/\.(py|js|java|c|cpp|cs|h|css|php|swift|go|rb|pl|sh|sql|xml|json|ts|jsx|vue|r|kt|dart|rs|lua|asm|bash|erl|hs|vbs|bat|f|lisp|scala|groovy|ps1)$/i) && settings?.code) {
        urls['code'].push(url);
    } else {
        urls['other'].push(url);
    }

    // Extract and store the domain
    let domain = extractDomain(url);
    if (domain && !urls['domains'].includes(domain)) {
        urls['domains'].push(domain);
    }

    // Send message every time a new URL is added
    chrome.runtime.sendMessage({ message: 'page_links', urls: urls });
}

function extractDomain(url: string): string {
    let domain;
    // find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    // find & remove port number
    domain = domain.split(':')[0];
    return domain;
}

function scrapeUrls(): void {
    // Get all img, video, audio, a, link, script, iframe, and object elements
    const imgElements = Array.from(document.getElementsByTagName('img'));
    const videoElements = Array.from(document.getElementsByTagName('video'));
    const audioElements = Array.from(document.getElementsByTagName('audio'));
    const aElements = Array.from(document.getElementsByTagName('a'));
    const linkElements = Array.from(document.getElementsByTagName('link'));
    const scriptElements = Array.from(document.getElementsByTagName('script'));


    // Process img elements
    for (let imgElement of imgElements) {
        if (imgElement.src) {
            classifyUrl(imgElement.src);
        }
    }

    // Process video elements and their source children
    for (let videoElement of videoElements) {
        if (videoElement.src) {
            classifyUrl(videoElement.src);
        }
        const sourceElements = Array.from(videoElement.getElementsByTagName('source'));
        for (let sourceElement of sourceElements) {
            if (sourceElement.src) {
                classifyUrl(sourceElement.src);
            }
        }
    }

    // Process audio elements and their source children
    for (let audioElement of audioElements) {
        if (audioElement.src) {
            classifyUrl(audioElement.src);
        }
        const sourceElements = Array.from(audioElement.getElementsByTagName('source'));
        for (let sourceElement of sourceElements) {
            if (sourceElement.src) {
                classifyUrl(sourceElement.src);
            }
        }
    }

    // Process a elements
    for (let aElement of aElements) {
        if (aElement.href) {
            classifyUrl(aElement.href);
        }
    }

    // Process link elements
    for (let linkElement of linkElements) {
        if (linkElement.href) {
            classifyUrl(linkElement.href);
        }
    }

    // Process script elements
    for (let scriptElement of scriptElements) {
        if (scriptElement.src) {
            classifyUrl(scriptElement.src);
        }
    }
}

let timer: ReturnType<typeof setTimeout> | null = null;

let observer = new MutationObserver((mutationsList) => {
    // Clear the previous timer, if it exists
    if (timer) {
        clearTimeout(timer);
    }

    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            let nodes = Array.from(mutation.addedNodes);
            for (let node of nodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    let htmlElement = node as HTMLElement;
                    let elements = ['img', 'video', 'audio', 'a', 'link', 'script', 'source'];
                    for (let elem of elements) {
                        let foundElements = htmlElement.getElementsByTagName(elem);
                        for (let foundElem of Array.from(foundElements)) {
                            if ((foundElem as HTMLImageElement).src || (foundElem as HTMLAnchorElement).href || (foundElem as HTMLObjectElement).data) {
                                classifyUrl((foundElem as HTMLImageElement).src || (foundElem as HTMLAnchorElement).href || (foundElem as HTMLObjectElement).data);
                            }
                        }
                    }
                    if ((htmlElement as HTMLImageElement).src || (htmlElement as HTMLAnchorElement).href || (htmlElement as HTMLObjectElement).data) {
                        classifyUrl((htmlElement as HTMLImageElement).src || (htmlElement as HTMLAnchorElement).href || (htmlElement as HTMLObjectElement).data);
                    }
                }
            }
        }
    }

    // Set a new timer
    timer = setTimeout(() => {
        observer.disconnect();
        console.log('Mutation observer disconnected due to inactivity');
    }, 10000);
});

chrome.runtime.onMessage.addListener(
    (request: { message: string }, sender: any, sendResponse: Function) => {
        if (request.message === "start_scraping") {

            urls = {
                'images': [],
                'audio': [],
                'video': [],
                'text': [],
                'code': [],
                'other': [],
                'domains': []
            };

            scrapeUrls();
            // Start observing for changes in the document when 'start_scraping' is received
            observer.observe(document, { attributes: false, childList: true, subtree: true });
        }
    });
