import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Record from "../components/Record/Record";
import "../../App.css";

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

  // Render the App component
  return (
    <div id="spawning-admin-panel">
      <label>
        <input
          type="checkbox"
          id="images"
          checked={options.images}
          onChange={handleChange}
        />
        Images
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="audio"
          checked={options.audio}
          onChange={handleChange}
        />
        Audio
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="video"
          checked={options.video}
          onChange={handleChange}
        />
        Video
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="text"
          checked={options.text}
          onChange={handleChange}
        />
        Text
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          id="code"
          checked={options.code}
          onChange={handleChange}
        />
        Code
      </label>
      <div id="status">{status}</div>
      <button id="save" onClick={saveOptions}>
        Save
      </button>

      <div id="urlRecords" className="record-container">
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
              <Record record={recordProps} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("root"));
