// Import necessary modules and components
import React, { useEffect, useState } from "react";

import styles from "./Record.module.scss";
import ImagesIcon from "../../../assets/icons/ImagesIcon";
import AudioIcon from "../../../assets/icons/AudioIcon";
import VideoIcon from "../../../assets/icons/VideoIcon";
import TextIcon from "../../../assets/icons/TextIcon";
import CodeIcon from "../../../assets/icons/CodeIcon";

// Define the type for RecordProps
type RecordProps = {
  record: {
    id?: string;
    url?: string;
    title?: string;
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

// Create the Record component
const Record: React.FC<RecordProps> = ({ record }) => {
  const [faviconUrl, setFaviconUrl] = useState("");

  // Function to format the URL
  const formatUrl = (url: string | undefined) => {
    if (!url) return "";

    let formattedUrl = url.replace(/(https?:\/\/)?(www\.)?/, "");

    if (formattedUrl.length > 25) {
      formattedUrl = formattedUrl.slice(0, 25) + "...";
    }

    return formattedUrl;
  };

  // Function to format the timestamp
  const formattedTimestamp = () => {
    if (!record.timestamp) return "";

    const timestampDate = new Date(record.timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (timestampDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (timestampDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return timestampDate.toLocaleDateString();
    }
  };

  // Function to fetch the favicon URL
  const fetchFaviconUrl = () => {
    if (!record.url) return;

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${record.url}`;
    setFaviconUrl(faviconUrl);
  };

  // Run the fetchFaviconUrl function when the component mounts
  useEffect(() => {
    fetchFaviconUrl();
  }, []);

  // Render the Record component
  return (
    <div className={styles.recordCardWrapper}>
      <div className={styles.recordCard}>
        {record.domains !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <TextIcon />
                <div>Domains</div>
              </span>
              <div className={styles.results}>{record.domains}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.images !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <ImagesIcon />
                <div>Images</div>
              </span>
              <div className={styles.results}>{record.images}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.audio !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <AudioIcon />
                <div>Audio</div>
              </span>
              <div className={styles.results}>{record.audio}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.video !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <VideoIcon />
                <div>Video</div>
              </span>
              <div className={styles.results}>{record.video}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.text !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <TextIcon />
                <div>Text</div>
              </span>
              <div className={styles.results}>{record.text}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.code !== 0 ? (
          <>
            <label className={styles.label}>
              <span className={styles.iconLabelWrapper}>
                <CodeIcon />
                <div>Code</div>
              </span>

              <div className={styles.results}>{record.code}</div>
            </label>
            <div className={styles.divider} />
          </>
        ) : null}

        {record.other !== 0 ? (
          <label className={styles.label}>
            <span className={styles.iconLabelWrapper}>
              <TextIcon />
              <div>Other</div>
            </span>
            <div className={styles.results}>{record.other}</div>
          </label>
        ) : null}
      </div>
    </div>
  );
};

// Export the Record component
export default Record;
