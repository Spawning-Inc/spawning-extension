import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const MainComponent = () => {
  const [scriptsReady, setScriptsReady] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [prevUrlsJSON, setPrevUrlsJSON] = useState(JSON.stringify({}));
  const [fetchInterval, setFetchInterval] = useState<NodeJS.Timeout | null>(null);

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
    chrome.runtime.sendMessage({ message: 'get_links' }, (response) => {
      const domainTotal = document.getElementById('domain_total');
      const imagesTotal = document.getElementById('images_total');
      const audioTotal = document.getElementById('audio_total');
      const videoTotal = document.getElementById('video_total');
      const textTotal = document.getElementById('text_total');
      const codeTotal = document.getElementById('code_total');
      const otherTotal = document.getElementById('other_total');
      const statusMessage = document.getElementById('status_message');

      if (response && response.urls) {
        const newUrlsJSON = JSON.stringify(response.urls);
        if (newUrlsJSON !== prevUrlsJSON) {
          setLastUpdate(Date.now());
          setPrevUrlsJSON(newUrlsJSON);
          [domainTotal, imagesTotal, audioTotal, videoTotal, textTotal, codeTotal, otherTotal, statusMessage].forEach(el => {
            if (el) el.textContent = '';
          });
        } else {
          if (Date.now() - lastUpdate >= 5000) {
            clearInterval(fetchInterval as any);
            console.log('Stopped fetching new URLs due to no updates');
            if (statusMessage) {
              statusMessage.textContent = 'Done';
              statusMessage.appendChild(createLink(response.urls));
            }
          }
        }

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
      }
    });
  };

  // useEffect(() => {
  //   const messageListener = (message: { type: string }, sender: {}, sendResponse: {}) => {
  //     if (message.type === 'content_ready') {
  //       setContentReady(true);
  //     }
  //     else if (message.type === 'background_ready') {
  //       setBackgroundReady(true);
  //     }
  //   };

  //   chrome.runtime.onMessage.addListener(messageListener);

  //   return () => chrome.runtime.onMessage.removeListener(messageListener);
  // }, []);

  // // Set scriptsReady to true when both content and background scripts are ready
  // useEffect(() => {
  //   if (contentReady && backgroundReady) {
  //     setScriptsReady(true);
  //   }
  // }, [contentReady, backgroundReady]);

  useEffect(() => {
    if (scriptsReady) {
      const intervalId = setInterval(fetchAndDisplayUrls, 500);
      setFetchInterval(intervalId);
    }
    return () => {
      if (fetchInterval) {
        clearInterval(fetchInterval);
        setFetchInterval(null);
      }
    };
  }, [lastUpdate, prevUrlsJSON, scriptsReady]);

  const sendMessageToActiveTab = (message: any) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { message });
      }
    });
  };

  useEffect(() => {
    // Only send start_scraping message when scripts are ready
    if (scriptsReady) {
      sendMessageToActiveTab("start_scraping");
    }
  }, [scriptsReady]);

  const handleOptionsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('../pages/options.html'));
    }
  };

  useEffect(() => {
    const goToOptionsButton = document.querySelector('#go-to-options');
    goToOptionsButton?.addEventListener('click', handleOptionsClick);

    // Clean up the event listener on component unmount
    return () => {
      goToOptionsButton?.removeEventListener('click', handleOptionsClick);
    }
  }, []);

  // // Checking for content.js and background.js
  // useEffect(() => {
  //   const checkContentAndBackground = async () => {
  //     try {
  //       const [contentResponse, backgroundResponse] = await Promise.all([
  //         fetch('../content.js'),
  //         fetch('../background.js')
  //       ]);

  //       if (!contentResponse.ok) {
  //         throw new Error(`content.js not found`);
  //       }

  //       if (!backgroundResponse.ok) {
  //         throw new Error(`background.js not found`);
  //       }

  //       console.log(`content.js and background.js loaded successfully`);

  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   checkContentAndBackground();
  // }, []);

  return <App />;
};

const root = document.createElement("div");
root.className = "container";
document.body.appendChild(root);
ReactDOM.render(
  <React.StrictMode>
    <MainComponent />
  </React.StrictMode>,
  root
);