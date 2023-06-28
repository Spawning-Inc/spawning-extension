import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Record from "../components/Record/Record";
import "@dotlottie/player-component";
import "../../global.css";
import styles from "./OptionsPage.module.scss";
import SpawningHeaderLogo from "../../assets/icons/SpawningHeaderLogo";
import SearchLogItem from "../components/SearchLogItem/SearchLogItem";
import TrashIcon from "../../assets/icons/TrashIcon";
import Pagination from "@mui/material/Pagination";

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

type Records = {
  id: string;
  record: {
    links: Links;
    timestamp: string;
    currentUrl: string;
    hibtLink: string;
  };
}[];

const ITEMS_PER_PAGE = 10;

// Main App component
function App() {
  const [urlRecords, setUrlRecords] = useState<Records>([]);
  const [urlRecordsToDisplay, setUrlRecordsToDisplay] = useState<Records>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    from: 0,
    to: ITEMS_PER_PAGE,
  });

  // Effect to handle fetching URL records and visibility change
  useEffect(() => {
    // Initial fetch

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

        setPagination({ ...pagination, count: Object.keys(urlRecords).length });

        const transformedUrlRecords = Object.entries(urlRecords).map((i) => ({
          id: i[0],
          record: i[1],
        }));

        setUrlRecords(transformedUrlRecords);
        setUrlRecordsToDisplay(transformedUrlRecords.slice(0, ITEMS_PER_PAGE));
      });
    };

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

  useEffect(() => {
    setUrlRecordsToDisplay(urlRecords.slice(pagination.from, pagination.to));
  }, [pagination]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    event.preventDefault();
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = ITEMS_PER_PAGE * page;

    setPage(page);

    setPagination({ ...pagination, from, to });
  };

  const changeLog = chrome.runtime.getManifest();

  // Render the App component
  return (
    <div className={styles.optionsPageWrapper}>
      <div className={styles.headerWrapper} aria-description="Spawning Logo">
        <SpawningHeaderLogo />
      </div>
      <div className={styles.upperPartWrapper}>
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
            training sets. Explore a new level of data transparency and control
            at{" "}
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
            <h3>
              Version: {changeLog.version} - {changeLog.description}
            </h3>
          </div>
        </div>

        <div>
          <span className={styles.searchLogHeader}>
            <h2>Search log</h2>

            <button className={styles.clearSearchHistoryButton}>
              clear history
              <TrashIcon />
            </button>
          </span>
          <p>
            Search log is only stored locally. Spawning does not store your
            searches.
          </p>
        </div>
      </div>

      <div className={styles.searchHistoryContainer}>
        {urlRecordsToDisplay.map(({ id, record }) => {
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

      <div className={styles.paginationWrapper}>
        <Pagination
          page={page}
          count={Math.ceil(pagination.count / ITEMS_PER_PAGE)}
          onChange={handlePageChange}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.linksWrapper}>
          <a href="">Terms of service</a>
          <a
            href="https://site.spawning.ai/contact"
            target="_blank"
            rel="noreferer"
          >
            Contact
          </a>
        </div>
        <div
          className={styles.footerSpawningLogo}
          aria-description="spawning logo used for footer"
        >
          <SpawningHeaderLogo />
        </div>
      </div>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
