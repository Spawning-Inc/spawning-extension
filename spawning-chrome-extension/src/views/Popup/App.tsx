import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import '../../App.css'

function App() {
  const [scriptsActive, setScriptsActive] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const [observerActive, setObserverActive] = useState(true);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  const getObserverState = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.runtime.sendMessage({ message: 'get_observer_state', tabId: tabs[0].id }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (response) {
            console.log("state:" + response.observerState)
            setObserverActive(response.observerState);
          }
        });
      }
    });
  };

  useEffect(() => {
    const statusMessage = document.getElementById('status_message');
    if (statusMessage) {
      if (observerActive) {
        statusMessage.textContent = 'Processing';
      } else {
        statusMessage.textContent = 'Done';
        const downloadButton = document.getElementById('download_button');
        if (downloadButton) {
          getLinks().then((links) => {
            const link = createLink(links);
            downloadButton.appendChild(link);
          }).catch((error) => {
            console.error('Failed to get links:', error);
          });
        }
      }
    }
  }, [observerActive]);

  const sendMessageToActiveTab = (message: any) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { message, tabId: tabs[0].id });
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
          chrome.tabs.sendMessage(tabs[0].id, { message: "start_scraping", tabId: tabs[0].id }, (response) => {
            console.log(response.message);
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else if (response) {
              console.log(response.message);
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.runtime.sendMessage({ message: 'get_links', tabId: activeTab.id }, (response: any) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }

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
      } else {
        console.error('No active tab found');
      }
    });
  };

  const getLinks = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.runtime.sendMessage({ message: 'get_links', tabId: activeTab.id }, (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
              return;
            }

            console.log('Response:', response);

            if (!response || !response.urls) {
              console.error('Error: Response or response.urls is undefined');
              reject('Error: Response or response.urls is undefined');
              return;
            }

            // Resolve the Promise with the URLs
            resolve(response.urls);
          });
        } else {
          console.error('No active tab found');
          reject('No active tab found');
        }
      });
    });
  };

  const pingScripts = () => {
    chrome.runtime.sendMessage({ message: 'ping' }, (response: any) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response?.message === 'background_active') {
        console.log('Scripts are active');
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
    if (scriptsActive && scrapeActive && observerActive) {
      fetchIntervalRef.current = setInterval(() => {
        fetchAndDisplayUrls();
        getObserverState(); // Add this line
      }, 300); // This will execute fetchAndDisplayUrls every 0.5 seconds
    } else if (fetchIntervalRef.current) {
      // If observerActive is false, clear the interval
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }
  }, [scriptsActive, scrapeActive, observerActive]);

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
    <div className="App">
      <link rel="stylesheet" href="App.css"></link>
      <body id="spawning-admin-panel">
        <div className="content">
          <span><img src="../assets/icon.svg" alt="icon" height={128} width={128} /><h1>Report Card</h1></span>
          <div id="domain_total"></div>
          <div id="images_total"></div>
          <div id="audio_total"></div>
          <div id="video_total"></div>
          <div id="text_total"></div>
          <div id="code_total"></div>
          <div id="other_total"></div>
          <div id="status_message"></div>
          <div id="download_button"></div>
          <button id="go-to-options" onClick={handleOptionsClick}>Go to Options</button>
          <button id="start-scraping" onClick={handleScrapeClick}>Scrape</button>
        </div>
      </body>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));