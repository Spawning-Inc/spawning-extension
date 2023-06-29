// Import necessary modules and components
import React, { useEffect, useState } from "react";

import styles from "./Record.module.scss";
import ImagesIcon from "../../../assets/icons/ImagesIcon";
import AudioIcon from "../../../assets/icons/AudioIcon";
import VideoIcon from "../../../assets/icons/VideoIcon";
import TextIcon from "../../../assets/icons/TextIcon";
import CodeIcon from "../../../assets/icons/CodeIcon";

// Create the Record component
const Record: React.FC<RecordProps> = ({ record }) => {
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
