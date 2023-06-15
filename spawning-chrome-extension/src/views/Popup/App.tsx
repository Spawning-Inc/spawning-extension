import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { BsFillInfoCircleFill, BsFillFileTextFill } from "react-icons/bs"; // import info icon
import '../../App.css'

function App() {
  const [scriptsActive, setScriptsActive] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const [scrapingStarted, setScrapingStarted] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [observerActive, setObserverActive] = useState(true);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  interface Links {
    images: string[];
    audio: string[];
    video: string[];
    text: string[];
    code: string[];
    other: string[];
    domains: string[];
  };

  const getObserverState = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.runtime.sendMessage({ message: 'get_observer_state', tabId: tabs[0].id }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (response) {
            console.log("Current observer state:" + response.observerState)
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
        statusMessage.textContent = '';
      } else {
        statusMessage.textContent = 'Done';
        setSearchComplete(true);
        const downloadButton = document.getElementById('download_button');
        if (downloadButton) {
          getLinks().then((links) => {
            // TODO: what can we pass in?
            // createLink(links).then((link) => { // pass the whole object
            //     downloadButton.appendChild(link);
            // });
            createLink(links as Links).then((link) => {
              downloadButton.appendChild(link);
            });
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
    setScrapingStarted(true);
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

  const createLink = async (links: Links) => {
    // Create a new anchor element
    const a = document.createElement('a');

    const urls = (links as { images: string[] })["images"];
    // Send a POST request to the API
    try {
      const response = await axios.post('https://hibt-passthrough.spawningaiapi.com/api/v1/materialize/urls/', {
        urls,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Extract the id from the response
      const { id } = response.data;

      // Create the link using the received id
      a.href = `https://haveibeentrained.com?materialize_id=${id}`;
      a.target = '_blank';
      ReactDOM.render(<BsFillFileTextFill />, a);

      // Get the current timestamp
      const timestamp = new Date().toISOString();

      // Get the current tab's URL
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0]?.url || 'N/A';

        // Save the data to chrome storage
        chrome.storage.local.set({
          [`urlRecord_${id}`]: {
            links,
            timestamp,
            currentUrl,
          }
        }, function () {
          console.log(`Urls are saved with id ${id}`);
        });
      });

    } catch (error) {
      console.error('API request failed:', error);
      // handle the error appropriately
    }

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
          <img src="../assets/header.svg" alt="icon" width={250} />
          <div id="main-content">
            {!scrapingStarted && (
              <button id="start-sccraping" className='buttonSecondary' onClick={handleScrapeClick}>Inspect</button>
            )}
            {scrapingStarted && !searchComplete && (
              <img id="searching" src="../assets/searching.gif" alt="Searching icon" height={100} />
            )}
          </div>
          <div id="domain_total"></div>
          <div id="images_total"></div>
          <div id="audio_total"></div>
          <div id="video_total"></div>
          <div id="text_total"></div>
          <div id="code_total"></div>
          <div id="other_total"></div>
          <div id="status_message"></div>
          {/* Make sure to give this div an appropriate style to hold the link */}
          <div id="download_button"></div>
          <button id="go-to-options" onClick={handleOptionsClick}><BsFillInfoCircleFill /></button>
        </div>
      </body>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));