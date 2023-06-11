let lastUpdate: number = Date.now();
let prevUrlsJSON: string = JSON.stringify({});

function generateLink(urls: any): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a');
    link.download = 'urls.json';
    link.textContent = 'Download URLs';

    const data: Blob = new Blob([JSON.stringify(urls)], { type: 'application/json' });
    const url: string = window.URL.createObjectURL(data);

    link.href = url;

    return link;
}

function fetchAndDisplayUrls(): void {
    chrome.runtime.sendMessage({ message: 'get_links' }, (response: any) => {
        const domainTotal: HTMLElement | null = document.getElementById('domain_total');
        const imagesTotal: HTMLElement | null = document.getElementById('images_total');
        const audioTotal: HTMLElement | null = document.getElementById('audio_total');
        const videoTotal: HTMLElement | null = document.getElementById('video_total');
        const textTotal: HTMLElement | null = document.getElementById('text_total');
        const codeTotal: HTMLElement | null = document.getElementById('code_total');
        const otherTotal: HTMLElement | null = document.getElementById('other_total');
        const statusMessage: HTMLElement | null = document.getElementById('status_message');

        if (response && response.urls) {
            const newUrlsJSON: string = JSON.stringify(response.urls);

            if (newUrlsJSON !== prevUrlsJSON) {
                lastUpdate = Date.now();
                prevUrlsJSON = newUrlsJSON;

                if (domainTotal) domainTotal.textContent = '';
                if (imagesTotal) imagesTotal.textContent = '';
                if (audioTotal) audioTotal.textContent = '';
                if (videoTotal) videoTotal.textContent = '';
                if (textTotal) textTotal.textContent = '';
                if (codeTotal) codeTotal.textContent = '';
                if (otherTotal) otherTotal.textContent = '';
                if (statusMessage) statusMessage.textContent = '';

            } else {
                if (Date.now() - lastUpdate >= 5000) {
                    clearInterval(fetchInterval);
                    console.log('Stopped fetching new URLs due to no updates');
                    if (statusMessage) statusMessage.textContent = 'Done';

                    const link: HTMLAnchorElement = generateLink(response.urls);
                    if (statusMessage) statusMessage.appendChild(link);

                    return;
                }
            }

            if (domainTotal) domainTotal.textContent = 'Total unique domains: ' + (response.urls['domains'] ? response.urls['domains'].length : 0);

            if (imagesTotal) imagesTotal.innerHTML = `<img src="../assets/images.svg" alt="Images icon"> Images: ${response.urls['images'] ? response.urls['images'].length : 0}`;
            if (audioTotal) audioTotal.innerHTML = `<img src="../assets/audio.svg" alt="Audio icon"> Audio: ${response.urls['audio'] ? response.urls['audio'].length : 0}`;
            if (videoTotal) videoTotal.innerHTML = `<img src="../assets/video.svg" alt="Video icon"> Video: ${response.urls['video'] ? response.urls['video'].length : 0}`;
            if (textTotal) textTotal.innerHTML = `<img src="../assets/text.svg" alt="Text icon"> Text: ${response.urls['text'] ? response.urls['text'].length : 0}`;
            if (codeTotal) codeTotal.innerHTML = `<img src="../assets/code.svg" alt="Code icon"> Code: ${response.urls['code'] ? response.urls['code'].length : 0}`;
            if (otherTotal) otherTotal.textContent = 'Other: ' + (response.urls['other'] ? response.urls['other'].length : 0);
            if (statusMessage) statusMessage.textContent = 'Processing';
        }
    });
}

const fetchInterval = setInterval(fetchAndDisplayUrls, 500) as unknown as number;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: chrome.tabs.Tab[]) {
    if (tabs.length > 0 && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, { "message": "start_scraping" });
    }
});


document.querySelector('#go-to-options')?.addEventListener('click', function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('../pages/options.html'));
    }
});
