// Import necessary modules and components
import React, { useEffect, useState } from "react";
import {
  BsImages,
  BsFileMusic,
  BsFillCameraVideoFill,
  BsFillFileEarmarkTextFill,
  BsCodeSquare,
  BsCloud,
  BsHash,
  BsFillFileEarmarkBarGraphFill,
} from "react-icons/bs";

import styles from "./Record.module.scss";

// Define the type for RecordProps
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
    <div className={styles.recordCard}>
      {record.url ? (
        <>
          {faviconUrl && <img src={faviconUrl} alt="Favicon" />}
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {formatUrl(record.url)}
          </a>
        </>
      ) : (
        <br />
      )}
      {record.timestamp ? <div>{formattedTimestamp()}</div> : <br />}
      {record.domains !== 0 && (
        <div>
          <BsCloud /> Domains: {record.domains}
        </div>
      )}
      {record.images !== 0 && (
        <div>
          <BsImages /> Images: {record.images}
        </div>
      )}
      {record.audio !== 0 && (
        <div>
          <BsFileMusic /> Audio: {record.audio}
        </div>
      )}
      {record.video !== 0 && (
        <div>
          <BsFillCameraVideoFill /> Video: {record.video}
        </div>
      )}
      {record.text !== 0 && (
        <div>
          <BsFillFileEarmarkTextFill /> Text: {record.text}
        </div>
      )}
      {record.code !== 0 && (
        <div>
          <BsCodeSquare /> Code: {record.code}
        </div>
      )}
      {record.other !== 0 && (
        <div>
          <BsHash /> Other: {record.other}
        </div>
      )}
      {record.hibtLink ? (
        <a className={styles.reportLink} href={record.hibtLink} target="_blank">
          <BsFillFileEarmarkBarGraphFill />
        </a>
      ) : (
        <br />
      )}
    </div>
  );
};

// Export the Record component
export default Record;
