import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Pagination from "@mui/material/Pagination";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { SnackbarCloseReason } from "@mui/material/Snackbar";

import "@dotlottie/player-component";
import Record from "../components/Record/Record";
import SearchLogItem from "../components/SearchLogItem/SearchLogItem";
import SpawningHeaderLogo from "../../assets/icons/SpawningHeaderLogo";
import TrashIcon from "../../assets/icons/TrashIcon";

import styles from "./OptionsPage.module.scss";
import "../../global.css";

const ITEMS_PER_PAGE = 10;
const deleteRecordUrl = process.env.OPTIONS_PAGE_DELETE_RECORD_URL;
const validateRecordUrl = process.env.OPTIONS_PAGE_VALIDATE_RECORD_URL;
const gitUrl = process.env.OPTIONS_PAGE_GIT_URL;
const contactUrl = process.env.OPTIONS_PAGE_CONTACT_URL;
const tosUrl = process.env.OPTIONS_PAGE_TOS_URL;
const globalDebug = process.env.GLOBAL_DEBUG;
let isDebugMode = true;

if (typeof globalDebug !== "undefined") {
  isDebugMode = globalDebug.toLowerCase() === "true";
}

// Main App component
function App() {
  const [urlRecords, setUrlRecords] = useState<Records>([]);
  const [urlRecordsToDisplay, setUrlRecordsToDisplay] = useState<Records>([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    from: 0,
    to: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    // Define the Record type
    interface Record {
      links: Links;
      timestamp: string;
      currentUrl: string;
      currentTitle: string;
      hibtLink: string;
    }

    const validateRecord = async (id: string): Promise<boolean> => {
      // Ensure validateRecordUrl is defined
      if (!validateRecordUrl) {
        console.error("validateRecordUrl is undefined");
        return false;
      }

      try {
        // Adjust the URL to match your endpoint's format
        const url = `${validateRecordUrl.replace('{materialized_id}', id)}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Parse the response and return the 'found' property
        const result = await response.json();
        return result.found;
      } catch (error) {
        console.error("Error validating record:", error);
        return false;
      }
    };

    // Function to fetch URL records and validate them
    const fetchUrlRecords = async () => {
      chrome.storage.local.get(null, async (items: { [key: string]: any }) => {
        let urlRecords: { [key: string]: Record } = {};
        for (const [key, value] of Object.entries(items)) {
          if (key.startsWith("urlRecord_")) {
            const id = key.slice(10);
            const isValid = await validateRecord(id);
            if (isValid) {
              urlRecords[id] = value as Record;
            }
          }
        }

        setPagination({ ...pagination, count: Object.keys(urlRecords).length });

        const transformedUrlRecords = Object.entries(urlRecords).map(([id, record]) => ({
          id,
          record,
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

  const handleClearHistory = async () => {
    try {
      for (let urlRecord of urlRecords) {
        const response = await fetch(`${deleteRecordUrl}?id=${urlRecord.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      }
      // All requests were successful, clear urlRecords state
      setUrlRecords([]);
      setUrlRecordsToDisplay([]);

      // Clear chrome local storage
      chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
          console.error(error);
        }
      });

      // Reset pagination
      setPagination({ count: 0, from: 0, to: ITEMS_PER_PAGE });

      // Open Snackbar
      setOpen(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClose = (
    event: React.SyntheticEvent<any, Event> | Event,
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleAlertClose = (event: React.SyntheticEvent<Element, Event>) => {
    setOpen(false);
  };

  // Render the App component
  return (
    <div className={styles.optionsPageWrapper}>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          color: "black",
          backgroundColor: "white",
          borderColor: "black",
          border: "1px solid",
          borderRadius: "5px",
        }}
      >
        <Alert
          onClose={handleAlertClose}
          severity="success"
          sx={{
            color: "black",
            backgroundColor: "white",
            borderColor: "black",
            border: "1px solid",
          }}
        >
          All reports have been deleted successfully!
        </Alert>
      </Snackbar>
      <div className={styles.headerWrapper} aria-description="Spawning Logo">
        <SpawningHeaderLogo />
      </div>
      <div className={styles.upperPartWrapper}>
        <div>
          <h2>Description</h2>
          <p className={styles.description}>
            The{" "}
            <a href="https://spawning.ai/" target="_blank" rel="noreferrer">
              Spawning
            </a>{" "}
            Extension searches the current page and returns the amount of media
            in the plugin. After the search is complete, you can identify
            whether any of the displayed images has been included in public
            datasets used to train AI models by clicking &#34;view media&#34;.
            Explore a new level of data transparency and control at{" "}
            <a href="https://spawning.ai/" target="_blank" rel="noreferrer">
              spawning.ai
            </a>
            .
          </p>
        </div>

        <div>
          <h2>Change log</h2>
          <a href={gitUrl} target="_blank" rel="noreferrer">
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

            <button
              id="clear-search-history-button"
              className={styles.clearSearchHistoryButton}
              onClick={handleClearHistory}
            >
              clear history
              <TrashIcon />
            </button>
          </span>
          <p>
            Your results are private and encrypted, and permanently deleted when
            the search logs cleared. Spawning cannot access your logs.
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
          recordProps.title = record.currentTitle;
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
          <a href={tosUrl} target="_blank" rel="noreferer">
            Terms of service
          </a>
          <a href={contactUrl} target="_blank" rel="noreferer">
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
