"use client";
/* eslint-disable @next/next/no-img-element */

import styles from "@/components/prototype2/usb-summary-card.module.css";

export function Prototype2UsbSummaryCard({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
}) {
  const statusText = checked ? "Allowed All" : "Block All";
  const statusIconSrc = checked
    ? "/prototype-2/icon-allowed.svg"
    : "/prototype-2/icon-blocked.svg";
  const connectionStateClassName = checked
    ? styles.connectionSceneAllowed
    : styles.connectionSceneBlocked;
  const toggleStateClassName = checked ? styles.toggleOn : styles.toggleOff;

  return (
    <div className={styles.card}>
      <div className={styles.header}>USB Control Status</div>

      <div className={styles.scene}>
        <div className={styles.connectionScene}>
          <div className={`${styles.hardwareGroup} ${connectionStateClassName}`}>
            <img
              src="/prototype-2/usb-cable.svg"
              alt=""
              className={styles.cable}
            />

            <div className={styles.statusCluster}>
              <div className={styles.statusLabel}>{statusText}</div>
              <div className={styles.statusIconShell}>
                <img
                  src={statusIconSrc}
                  alt=""
                  className={styles.statusIcon}
                />
              </div>
            </div>

            <img
              src="/prototype-2/laptop.svg"
              alt=""
              className={styles.laptop}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerTitle}>USB Access</div>
        <button
          type="button"
          className={`${styles.toggle} ${toggleStateClassName}`}
          onClick={() => onChange(!checked)}
          aria-pressed={checked}
          aria-label={`USB Access ${checked ? "enabled" : "disabled"}`}
        >
          <span className={styles.toggleTrack} />
          <span className={styles.toggleThumb} />
        </button>
      </div>
    </div>
  );
}
