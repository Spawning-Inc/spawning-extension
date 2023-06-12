import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const MainComponent = () => {
  const [scriptsActive, setScriptsActive] = React.useState(false);
  const [scrapeActive, setScrapeActive] = React.useState(false);
  const retryCount = React.useRef(0);

  const sendMessageToActiveTab = (message: any) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { message });
      }
    });
  };

  const handleOptionsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('../js/options.html'));
    }
  };

  const handleScrapeClick = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { message: "start_scraping" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              setScrapeActive(true);
              resolve(response);
            }
          });
        }
      });
    });
  };

  const createLink = (urls: any) => {
    const a = document.createElement('a');
    a.download = 'urls.json';
    a.textContent = 'Download URLs';
    const data = new Blob([JSON.stringify(urls)], { type: 'application/json' });
    const url = window.URL.createObjectURL(data);
    a.href = url;
    return a;
  };

  const fetchAndDisplayUrls = () => {
    chrome.runtime.sendMessage({ message: 'get_links' }, (response: any) => {
      console.log('Response:', response); // Log the received response for debugging

      if (!response || !response.urls) {
        // Handle the error appropriately.
        console.error('Error: Response or response.urls is undefined');
        return;
      }

      const statusMessage = document.getElementById('status_message');
      const domainTotal = document.getElementById('domain_total');
      const imagesTotal = document.getElementById('images_total');
      const audioTotal = document.getElementById('audio_total');
      const videoTotal = document.getElementById('video_total');
      const textTotal = document.getElementById('text_total');
      const codeTotal = document.getElementById('code_total');
      const otherTotal = document.getElementById('other_total');

      const { domains, images, audio, video, text, code, other } = response.urls;

      if (domainTotal) {
        domainTotal.textContent = `Total unique domains: ${domains ? domains.length : 0}`;
      }
      if (imagesTotal) {
        imagesTotal.innerHTML = `<img src="../assets/images.svg" alt="Images icon"> Images: ${images ? images.length : 0}`;
      }
      if (audioTotal) {
        audioTotal.innerHTML = `<img src="../assets/audio.svg" alt="Audio icon"> Audio: ${audio ? audio.length : 0}`;
      }
      if (videoTotal) {
        videoTotal.innerHTML = `<img src="../assets/video.svg" alt="Video icon"> Video: ${video ? video.length : 0}`;
      }
      if (textTotal) {
        textTotal.innerHTML = `<img src="../assets/text.svg" alt="Text icon"> Text: ${text ? text.length : 0}`;
      }
      if (codeTotal) {
        codeTotal.innerHTML = `<img src="../assets/code.svg" alt="Code icon"> Code: ${code ? code.length : 0}`;
      }
      if (otherTotal) {
        otherTotal.textContent = `Other: ${other ? other.length : 0}`;
      }
      if (statusMessage) {
        statusMessage.textContent = 'Processing';
      }
    });
  };

  const pingScripts = () => {
    chrome.runtime.sendMessage({ message: 'ping' }, (response: any) => {
      if (response?.message === 'background_active') {
        setScriptsActive(true);
      } else {
        retryCount.current++;
        setTimeout(pingScripts, 200);
      }
    });
  };

  useEffect(() => {
    if (!scriptsActive) {
      pingScripts();
    }
  }, [scriptsActive]);

  useEffect(() => {
    if (scriptsActive && scrapeActive) {
      for (let i = 0; i < 5; i++) {
        fetchAndDisplayUrls();
      }
    }
  }, [scriptsActive, scrapeActive]);

  useEffect(() => {
    const goToOptionsButton = document.querySelector('#go-to-options');
    goToOptionsButton?.addEventListener('click', handleOptionsClick);

    // Clean up the event listener on component unmount
    return () => {
      goToOptionsButton?.removeEventListener('click', handleOptionsClick);
    };
  }, []);

  useEffect(() => {
    const startScrapingButton = document.querySelector('#start-scraping');
    startScrapingButton?.addEventListener('click', handleScrapeClick);

    // Clean up the event listener on component unmount
    return () => {
      startScrapingButton?.removeEventListener('click', handleScrapeClick);
    };
  }, []);

  return (
    <div>
      <button id="go-to-options" onClick={handleOptionsClick}>Go to Options</button>
      <button id="start-scraping" onClick={handleScrapeClick}>Scrape</button>
      <App />
    </div>
  );
};

const root = document.createElement('div');
root.className = 'container';
document.body.appendChild(root);
ReactDOM.render(
  <React.StrictMode>
    <MainComponent />
  </React.StrictMode>,
  root
);
