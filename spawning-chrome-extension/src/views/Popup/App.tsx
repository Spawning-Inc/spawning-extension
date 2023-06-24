import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { BsFillFileTextFill, BsInfoCircle } from "react-icons/bs";
import StatusMessage from "../components/StatusMessage";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import ConfigureIcon from "../../assets/icons/ConfigureIcon";
import SearchIcon from "../../assets/icons/SearchIcon";
import "@dotlottie/player-component";

import styles from "./popupApp.module.scss";
import Config from "../components/Config/Config";

function App() {
  // State variables
  const [scriptsActive, setScriptsActive] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const [scrapingStarted, setScrapingStarted] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [observerActive, setObserverActive] = useState(true);
  const [optionsSavedSuccessfully, setOptionsSavedSuccessfully] =
    useState(false);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  const [configOptions, setConfigOptions] = useState({
    images: true,
    audio: true,
    video: true,
    text: true,
    code: true,
  });

  console.log("Config options:", configOptions);

  // Interface for Links
  interface Links {
    images: string[];
    audio: string[];
    video: string[];
    text: string[];
    code: string[];
    other: string[];
    domains: string[];
  }

  // State for record
  const [record, setRecord] = useState<{
    id: any;
    url: string | undefined;
    timestamp: string | undefined;
    hibtLink: string | undefined;
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
    hibtLink: undefined,
    domains: 0,
    images: 0,
    audio: 0,
    video: 0,
    text: 0,
    code: 0,
    other: 0,
  });

  // Function to get the observer state from the active tab
  const getObserverState = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.runtime.sendMessage(
          { message: "get_observer_state", tabId: tabs[0].id },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            if (response) {
              console.log("Current observer state:" + response.observerState);
              setObserverActive(response.observerState);
            }
          }
        );
      }
    });
  };

  // Effect hook to handle observer state changes
  useEffect(() => {
    if (!observerActive) {
      setSearchComplete(true);
      getLinks()
        .then((links) => {
          createLink(links as Links);
        })
        .catch((error) => {
          console.error("Failed to get links:", error);
        });
    }
  }, [observerActive]);

  // Function to send a message to the active tab
  const sendMessageToActiveTab = (message: any) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { message, tabId: tabs[0].id });
      }
    });
  };

  // Function to handle options button click
  const handleOptionsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("../js/options.html"));
    }
  };

  // Function to handle button click
  const handleClick = () => {
    console.log("Button clicked");
  };

  // Function to handle scrape button click
  const handleScrapeClick = () => {
    setScrapingStarted(true);
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { message: "start_scraping", tabId: tabs[0].id },
            (response) => {
              console.log(response.message);
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
              } else if (response) {
                console.log(response.message);
                setScrapeActive(true);
                resolve(response);
              }
            }
          );
        }
      });
    });
  };

  // Function to create a link element with the given links
  const createLink = async (links: Links) => {
    // Create a new anchor element
    const a = document.createElement("a");

    const newSalt = uuidv4(); // Generates a random UUID
    const urls = (links as { images: string[] })["images"];
    const encrypted = urls.map((url) =>
      CryptoJS.AES.encrypt(url, newSalt).toString()
    );
    // Send a POST request to the API
    try {
      const response = await axios.post(
        "https://hibt-passthrough.spawningaiapi.com/api/v1/materialize/urls/",
        {
          urls: encrypted,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract the id from the response
      const { id } = response.data;

      const hibtLink = `https://patrick-materialize.spawning-have-i-been-trained.pages.dev/?materialize=${id}&salt=${newSalt}`;
      console.log(hibtLink);

      a.href = hibtLink;
      a.target = "_blank";
      ReactDOM.render(<BsFillFileTextFill />, a);

      // Get the current timestamp
      const timestamp = new Date().toLocaleString();

      // Get the current tab's URL
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0]?.url || "N/A";

        // Save the data to chrome storage
        chrome.storage.local.set(
          {
            [`urlRecord_${id}`]: {
              links,
              timestamp,
              currentUrl,
              hibtLink,
            },
          },
          function () {
            console.log(`Urls are saved with id ${id}`);
          }
        );

        // Set record id, url, and timestamp
        setRecord((prevRecord) => ({
          ...prevRecord,
          id: id || undefined, // Assign undefined if id is null
          url: currentUrl || undefined, // Assign undefined if currentUrl is null
          timestamp: timestamp || undefined, // Assign undefined if readableTimestamp is null
          hibtLink: hibtLink || undefined,
        }));
      });
    } catch (error) {
      console.error("API request failed:", error);
      // handle the error appropriately
    }

    return a;
  };

  // Function to fetch and display URLs
  const fetchAndDisplayUrls = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab) {
        chrome.runtime.sendMessage(
          { message: "get_links", tabId: activeTab.id },
          (response: any) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }

            console.log("Response:", response); // Log the received response for debugging

            if (!response || !response.urls) {
              // Handle the error appropriately.
              console.error("Error: Response or response.urls is undefined");
              return;
            }

            const { domains, images, audio, video, text, code, other } =
              response.urls;

            setRecord((prevRecord) => ({
              ...prevRecord,
              domains: domains ? domains.length : 0,
              images: images ? images.length : 0,
              audio: audio ? audio.length : 0,
              video: video ? video.length : 0,
              text: text ? text.length : 0,
              code: code ? code.length : 0,
              other: other ? other.length : 0,
            }));
          }
        );
      } else {
        console.error("No active tab found");
      }
    });
  };

  // Function to get links from the active tab
  const getLinks = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
          chrome.runtime.sendMessage(
            { message: "get_links", tabId: activeTab.id },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
              }

              console.log("Response:", response);

              if (!response || !response.urls) {
                console.error("Error: Response or response.urls is undefined");
                reject("Error: Response or response.urls is undefined");
                return;
              }

              // Resolve the Promise with the URLs
              resolve(response.urls);
            }
          );
        } else {
          console.error("No active tab found");
          reject("No active tab found");
        }
      });
    });
  };

  // Function to ping scripts and check if they are active
  const pingScripts = () => {
    chrome.runtime.sendMessage({ message: "ping" }, (response: any) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      if (response?.message === "background_active") {
        console.log("Scripts are active");
        setScriptsActive(true);
      } else {
        retryCount.current++;
        setTimeout(pingScripts, 200);
      }
    });
  };

  // Effect hook to check if scripts are active
  useEffect(() => {
    if (!scriptsActive) {
      pingScripts();
    }
  }, [scriptsActive]);

  // Effect hook to handle script, scrape, and observer state changes
  useEffect(() => {
    if (scriptsActive && scrapeActive && observerActive) {
      fetchIntervalRef.current = setInterval(() => {
        fetchAndDisplayUrls();
        getObserverState();
      }, 300); // This will execute fetchAndDisplayUrls every 0.5 seconds
    } else if (fetchIntervalRef.current) {
      // If observerActive is false, clear the interval
      clearInterval(fetchIntervalRef.current);
      fetchIntervalRef.current = null;
    }
  }, [scriptsActive, scrapeActive, observerActive]);

  // Effect hook to handle options button click
  useEffect(() => {
    const goToOptionsButton = document.querySelector("#go-to-options");
    goToOptionsButton?.addEventListener("click", handleOptionsClick);

    // Clean up the event listener on component unmount
    return () => {
      goToOptionsButton?.removeEventListener("click", handleOptionsClick);
    };
  }, []);

  // Effect hook to handle scrape button click
  useEffect(() => {
    const startScrapingButton = document.querySelector("#start-scraping");
    startScrapingButton?.addEventListener("click", handleScrapeClick);

    // Clean up the event listener on component unmount
    return () => {
      startScrapingButton?.removeEventListener("click", handleScrapeClick);
    };
  }, []);

  // Function to handle checkbox change
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigOptions({
      ...configOptions,
      [e.target.id]: e.target.checked,
    });
  };

  const saveOptions = () => {
    chrome.storage.sync.set({ ...configOptions }, () => {
      setOptionsSavedSuccessfully(true);

      setTimeout(() => {
        setOptionsSavedSuccessfully(false);
      }, 5000);
    });
  };

  return (
    <div>
      <body>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <img src="../assets/header.svg" alt="icon" width={150} />
            <button className={styles.infoButton} onClick={handleOptionsClick}>
              <BsInfoCircle />
            </button>
          </div>

          <div className={styles.contentWrapper}>
            <p className={styles.text}>
              Does this page contain content in public datasets used to train AI
              models? Click &#34;Inspect&#34; to find out.
            </p>
            {!scrapingStarted && scriptsActive && (
              <button
                className={styles.inspectButton}
                onClick={handleScrapeClick}
              >
                Inspect
                <SearchIcon />
              </button>
            )}

            {scrapingStarted && !searchComplete && (
              <dotlottie-player
                src="../../assets/lottie/searching.lottie"
                autoplay
                loop
                style={{ height: "100%", width: "100%" }}
              />
            )}
          </div>

          <button
            type="button"
            className={styles.configureButton}
            onClick={() => setIsConfigurationOpen(!isConfigurationOpen)}
          >
            Configure
            <ConfigureIcon />
          </button>

          {isConfigurationOpen ? (
            <div className={styles.configAndButtonWrapper}>
              <Config
                configOptions={configOptions}
                handleConfigChange={handleConfigChange}
              />
              {optionsSavedSuccessfully ? (
                <div className={styles.statusMessage}>
                  <p>Configuration saved!</p>
                </div>
              ) : (
                <button className={styles.saveButton} onClick={saveOptions}>
                  Save
                </button>
              )}
            </div>
          ) : null}
        </div>
      </body>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
