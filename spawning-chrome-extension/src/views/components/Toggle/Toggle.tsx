import React from "react";

import styles from "./Toggle.module.scss";

interface ToggleProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Toggle: React.FC<ToggleProps> = ({ name, checked, onChange }) => {
  return (
    <div className={styles.toggleSwitch}>
      <input
        type="checkbox"
        className={styles.toggleSwitchCheckbox}
        name={name}
        id={name}
        checked={checked}
        onChange={onChange}
      />
      <label className={styles.toggleSwitchLabel} htmlFor={name}>
        <span className={styles.toggleSwitchInner} />

        <span className={styles.toggleSwitchSwitch} />
      </label>
    </div>
  );
};

export default Toggle;
