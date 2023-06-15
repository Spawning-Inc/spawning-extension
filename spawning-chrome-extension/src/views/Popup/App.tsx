import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { BsFillInfoCircleFill, BsFillFileTextFill } from "react-icons/bs"; // import info icon
import Record from "../components/Record"
import StatusMessage from '../components/StatusMessage';

import '../../App.css'

function App() {
  const [scriptsActive, setScriptsActive] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const [scrapingStarted, setScrapingStarted] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [observerActive, setObserverActive] = useState(true);
  const [status, setStatus] = useState<string>('');
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

  const [record, setRecord] = useState<{
    id: any; 
    url: string | undefined; 
    timestamp: string | undefined; 
    domains: number; 
    images: number; 
    audio: number; 
    video: number; 
    text: number; 
    code: number; 
    other: number;
  }>({
    id: undefined,
    url: undefined,
    timestamp: undefined,
    domains: 0,
    images: 0,
    audio: 0,
    video: 0,
    text: 0,
    code: 0,
    other: 0,
  });

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
      if (!observerActive) {
        setStatus('Complete');
        setSearchComplete(true);
        getLinks().then((links) => {
          // TODO: what can we pass in?
          // createLink(links).then((link) => { // pass the whole object
          //     downloadButton.appendChild(link);
          // });
          createLink(links as Links).then((link) => {
            // downloadButton.appendChild(link);
          });
        }).catch((error) => {
          console.error('Failed to get links:', error);
        });
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

  const handleClick = () => {
    console.log('Button clicked');
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
      const timestamp = new Date().toLocaleString();

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

        // Set record id, url, and timestamp
        setRecord(prevRecord => ({
          ...prevRecord,
          id: id || undefined, // Assign undefined if id is null
          url: currentUrl || undefined, // Assign undefined if currentUrl is null
          timestamp: timestamp || undefined, // Assign undefined if readableTimestamp is null
        }));
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


          const { domains, images, audio, video, text, code, other } = response.urls;

          setRecord(prevRecord => ({
            ...prevRecord,
            domains: domains ? domains.length : 0,
            images: images ? images.length : 0,
            audio: audio ? audio.length : 0,
            video: video ? video.length : 0,
            text: text ? text.length : 0,
            code: code ? code.length : 0,
            other: other ? other.length : 0,
          }));
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
          {!scrapingStarted && scriptsActive && (
            <button id="start-scraping" className='buttonSecondary' onClick={handleScrapeClick}>Inspect</button>
          )}
            {scrapingStarted && !searchComplete && (
              <img id="searching" src="../assets/searching.gif" alt="Searching icon" height={100} />
            )}
          </div>
          <Record record={record} />
          <StatusMessage status={status} />
          <button id="go-to-options" onClick={handleOptionsClick}><BsFillInfoCircleFill /></button>
        </div>
      </body>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));