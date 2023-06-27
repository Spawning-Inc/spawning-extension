import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Record from "../components/Record/Record";
import "@dotlottie/player-component";
import "../../global.css";
import styles from "./OptionsPage.module.scss";
import SpawningHeaderLogo from "../../assets/icons/SpawningHeaderLogo";
import SearchLogItem from "../components/SearchLogItem/SearchLogItem";
import ArrowUpRightIcon from "../../assets/icons/ArrowUpRightIcon";

type Links = {
  images: string[];
  audio: string[];
  video: string[];
  text: string[];
  code: string[];
  other: string[];
  domains: string[];
};

type RecordProps = {
  record: {
    id?: string;
    url?: string;
    timestamp?: string;
    hibtLink?: string;
    domains: number;
    images: number;
    audio: number;
    video: number;
    text: number;
    code: number;
    other: number;
  };
};

// Main App component
function App() {
  // State variables
  const [options, setOptions] = useState({
    images: true,
    audio: true,
    video: true,
    text: true,
    code: true,
  });
  const [urlRecords, setUrlRecords] = useState<
    Record<
      string,
      { links: Links; timestamp: string; currentUrl: string; hibtLink: string }
    >
  >({});
  const [status, setStatus] = useState("");

  // Effect to handle fetching URL records and visibility change
  useEffect(() => {
    // Function to fetch URL records
    const fetchUrlRecords = () => {
      chrome.storage.local.get(null, function (items) {
        const urlRecords = Object.entries(items).reduce((acc, [key, value]) => {
          if (key.startsWith("urlRecord_")) {
            acc[key.slice(10)] = value as {
              links: Links;
              timestamp: string;
              currentUrl: string;
              hibtLink: string;
            };
          }
          return acc;
        }, {} as Record<string, { links: Links; timestamp: string; currentUrl: string; hibtLink: string }>);

        setUrlRecords(urlRecords);
      });
    };

    // Initial fetch
    fetchUrlRecords();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Tab has gained focus, refresh data
        fetchUrlRecords();
      }
    };

    // Add event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Function to save options
  const saveOptions = () => {
    chrome.storage.sync.set({ ...options }, () => {
      setStatus("Options saved.");
      setTimeout(() => {
        setStatus("");
      }, 750);
    });
  };

  // Function to handle checkbox change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      [e.target.id]: e.target.checked,
    });
  };

  console.log({ urlRecords });

  // Render the App component
  return (
    <div className={styles.optionsPageWrapper}>
      <div className={styles.headerWrapper} aria-description="Spawning Logo">
        <SpawningHeaderLogo />
      </div>

      <div>
        <h2>Description</h2>
        <p className={styles.description}>
          <a href="https://spawning.ai/" target="_blank" rel="noreferrer">
            Spawning
          </a>{" "}
          Chrome Extension searches the current page and returns the amount of
          media in the plugin. After the search is complete, you can identify
          whether any of the displayed data - from text to images and other
          media - has been included in public datasets used to train AI models
          by clicking &#34;view media&#34;. You can easily configure the
          extension to focus on specific types of media, ensuring that your
          search is as broad or as targeted as you need. Furthermore, the
          Spawning generates a comprehensive data consent report, allowing you
          to understand in detail the prevalence and use of your data in AI
          training sets. Explore a new level of data transparency and control at{" "}
          <a href="https://spawning.ai/" target="_blank" rel="noreferrer">
            spawning.ai
          </a>
          .
        </p>
      </div>

      <div>
        <h2>Change log</h2>
        <a
          href="https://github.com/Spawning-Inc/spawning-chrome-extension/tree/main"
          target="_blank"
          rel="noreferrer"
        >
          Source Code
        </a>
        <div>
          <h3>Version 1.0.0</h3>
          <div>change notes</div>
          <div>change notes</div>
        </div>
      </div>

      <div>
        <span>
          <h2>Search log</h2>

          <button>clear history</button>
        </span>
        <p>
          Search log is only stored locally. Spawning does not store your
          searches.
        </p>
      </div>
      <div className={styles.searchHistoryContainer}>
        {Object.entries(urlRecords).map(([id, record]) => {
          const recordProps: RecordProps["record"] = [
            "domains",
            "images",
            "audio",
            "video",
            "text",
            "code",
            "other",
          ].reduce((result, type) => {
            result[type as keyof Links] =
              record.links[type as keyof Links]?.length || 0;
            return result;
          }, {} as Record<keyof Links, number>);

          recordProps.id = id;
          recordProps.url = record.currentUrl;
          recordProps.timestamp = record.timestamp;
          recordProps.hibtLink = record.hibtLink;

          return (
            <div key={id}>
              <SearchLogItem record={recordProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
