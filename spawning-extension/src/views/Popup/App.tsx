import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { BsFillFileTextFill, BsInfoCircle } from "react-icons/bs";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

// import Config from "../components/Config/Config";
import Record from "../components/Record/Record";

// import ConfigureIcon from "../../assets/icons/ConfigureIcon";
import SearchIcon from "../../assets/icons/SearchIcon";
import ArrowUpRightIcon from "../../assets/icons/ArrowUpRightIcon";
import "@dotlottie/player-component";

import styles from "./popupApp.module.scss";

const postUrl = process.env.POPUP_PAGE_POST_URL;
const hibtUrl = process.env.POPUP_PAGE_HIBT_URL;
const globalDebug = process.env.GLOBAL_DEBUG;
let isDebugMode = true;

if (typeof globalDebug !== "undefined") {
  isDebugMode = globalDebug.toLowerCase() === "true";
}

function App() {
  // State variables
  const [scriptsActive, setScriptsActive] = useState(false);
  const [scrapeActive, setScrapeActive] = useState(false);
  const [scrapingStarted, setScrapingStarted] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [observerActive, setObserverActive] = useState(true);
  // const [optionsSavedSuccessfully, setOptionsSavedSuccessfully] =
  // useState(false);
  // const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  const [savedConfigOptions, setSavedConfigOptions] = useState<
    Config | undefined
  >();

  const [configOptions, setConfigOptions] = useState<Config>(
    savedConfigOptions || {
      images: true,
      audio: true,
      video: true,
      text: true,
      code: true,
    }
  );

  const [record, setRecord] = useState<RecordProps["record"]>({
    id: undefined,
    url: undefined,
    title: undefined,
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

  useEffect(() => {
    const handleConfigDefaultValues = async () => {
      await chrome.storage.sync.get(null, (result) => {
        setSavedConfigOptions(result as Config);
      });
    };

    handleConfigDefaultValues();
  }, []);

  useEffect(() => {
    setConfigOptions(
      savedConfigOptions || {
        images: true,
        audio: true,
        video: true,
        text: true,
        code: true,
      }
    );
  }, [savedConfigOptions]);

  // Function to get the observer state from the active tab
  const getObserverState = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.runtime.sendMessage(
          { message: "get_observer_state", tabId: tabs[0].id },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            if (response) {
              if (isDebugMode) {
                console.log("Current observer state:" + response.observerState);
              }
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

  // Function to handle options button click
  const handleOptionsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("../js/options.html"));
    }
  };

  // Function to handle scrape button click
  const handleScrapeClick = () => {
    // setIsConfigurationOpen(false);
    setScrapingStarted(true);
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { message: "start_scraping", tabId: tabs[0].id },
            (response) => {
              if (isDebugMode) {
                console.log(response);
                console.log(response.message);
              }
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
              } else if (response) {
                if (isDebugMode) {
                  console.log(response);
                  console.log(response.message);
                }
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
    const a = document.createElement("a");
    const newSalt = uuidv4(); // Generates a random UUID

    // Aggregate all links from different types into one array
    const allLinks: string[] = Object.values(links).flat();

    const encrypted = allLinks.map((url) =>
      CryptoJS.AES.encrypt(url, newSalt).toString()
    );

    if (!postUrl) {
      throw new Error(
        "POPUP_PAGE_POST_URL is not defined in environment variables"
      );
    }

    // Send a POST request to the API
    try {
      const response = await axios.post(
        postUrl,
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

      const hibtLink = `${hibtUrl}/?materialize=${id}&salt=${newSalt}`;

      a.href = hibtLink;
      a.target = "_blank";
      ReactDOM.render(<BsFillFileTextFill />, a);

      // Get the current timestamp
      const timestamp = new Date().toLocaleString();

      // Get the current tab's URL
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentUrl = tabs[0]?.url || "N/A";
        const currentTitle = tabs[0]?.title || "N/A";

        // Save the data to chrome storage
        chrome.storage.local.set(
          {
            [`urlRecord_${id}`]: {
              links,
              timestamp,
              currentUrl,
              currentTitle,
              hibtLink,
            },
          },
          function () {
            if (isDebugMode) {
              console.log(`Urls are saved with id ${id}`);
            }
          }
        );

        // Set record id, url, and timestamp
        setRecord((prevState) => ({
          ...prevState,
          id: id || undefined,
          url: currentUrl || undefined,
          title: currentTitle || undefined,
          timestamp: timestamp || undefined,
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

            if (isDebugMode) {
              console.log("Response:", response); // Log the received response for debugging
            }

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

              if (isDebugMode) {
                console.log("Response:", response);
              }

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
    chrome.runtime.sendMessage(
      { message: "check_background_active" },
      (response: any) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response?.message === "background_active") {
          if (isDebugMode) {
            console.log("background_active");
          }
          setScriptsActive(true);
        } else {
          retryCount.current++;
          setTimeout(pingScripts, 200);
        }
      }
    );
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
      }, 300);
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

  const renderHeaderText = () => {
    if (scrapingStarted && !searchComplete) {
      return (
        <p className={styles.text}>
          Hang on! We're currently searching through this site to find any
          content that lives on this page. Once we get that information, you can
          check if any of that media is in public data sets used to train AI
          models.{" "}
        </p>
      );
    }

    if (record && searchComplete) {
      return (
        <p className={styles.text}>
          The following content has been discovered on this page. Would you like
          to find out if it was included in datasets used to train AI models?
          Click &#34;View media&#34; to learn more, claim ownership of the
          content, and remove it from the datasets.
        </p>
      );
    }

    return (
      <p className={styles.text}>
        Does this page contain content in public datasets used to train AI
        models? Click &#34;Inspect&#34; to find out.
      </p>
    );
  };

  const NoMedia =
    !record.images &&
    !record.audio &&
    !record.text &&
    !record.code &&
    !record.video;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src="../assets/header.svg" alt="icon" width={150} />
        <button
          id="info-button"
          className={styles.infoButton}
          onClick={handleOptionsClick}
        >
          <BsInfoCircle />
        </button>
      </div>

      <div className={styles.contentWrapper}>
        {renderHeaderText()}
        {!scrapingStarted && scriptsActive && (
          <button
            id="start-scraping-button"
            className={styles.inspectButton}
            onClick={handleScrapeClick}
          >
            Inspect <SearchIcon />
          </button>
        )}

        {scrapingStarted && !searchComplete && (
          <dotlottie-player
            id="searching-animation"
            src="../../assets/lottie/searching.lottie"
            autoplay
            loop
            style={{ height: "100%", width: "100%" }}
          />
        )}
      </div>

      {record && searchComplete && (
        <div className={styles.recordWrapper}>
          <Record record={record} />

          <button
            id="view-result-button"
            className={styles.viewResultButton}
            disabled={NoMedia}
            onClick={() => {
              if (!NoMedia) {
                window.open(record.hibtLink || "");
              }
            }}
          >
            {NoMedia ? "No Searchable Media" : "View Media"}
            {!NoMedia && <ArrowUpRightIcon />}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
