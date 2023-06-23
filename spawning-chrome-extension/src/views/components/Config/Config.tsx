import React from "react";

import styles from "./Config.module.scss";
import TextIcon from "../../../assets/icons/TextIcon";
import ImagesIcon from "../../../assets/icons/ImagesIcon";
import AudioIcon from "../../../assets/icons/AudioIcon";
import VideoIcon from "../../../assets/icons/VideoIcon";
import CodeIcon from "../../../assets/icons/CodeIcon";
import Toggle from "../Toggle/Toggle";

type ConfigOptions = {
  images: boolean;
  audio: boolean;
  video: boolean;
  text: boolean;
  code: boolean;
};

interface ConfigProps {
  configOptions: ConfigOptions;
  handleConfigChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Config: React.FC<ConfigProps> = ({
  configOptions,
  handleConfigChange,
}) => {
  return (
    <div className={styles.configWrapper}>
      <div className={styles.config}>
        <label className={styles.label}>
          <span className={styles.iconLabelWrapper}>
            <TextIcon />
            Text
          </span>
          <Toggle
            name="text"
            checked={configOptions.text}
            onChange={handleConfigChange}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.iconLabelWrapper}>
            <ImagesIcon />
            Images
          </span>
          <Toggle
            name="images"
            checked={configOptions.images}
            onChange={handleConfigChange}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.iconLabelWrapper}>
            <AudioIcon />
            Audio
          </span>
          <Toggle
            name="audio"
            checked={configOptions.audio}
            onChange={handleConfigChange}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.iconLabelWrapper}>
            <VideoIcon />
            Video
          </span>
          <Toggle
            name="video"
            checked={configOptions.video}
            onChange={handleConfigChange}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.iconLabelWrapper}>
            <CodeIcon />
            Code
          </span>
          <Toggle
            name="code"
            checked={configOptions.code}
            onChange={handleConfigChange}
          />
        </label>
      </div>
    </div>
  );
};

export default Config;
