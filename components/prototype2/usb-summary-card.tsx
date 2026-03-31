"use client";
/* eslint-disable @next/next/no-img-element */

import { Usb } from "lucide-react";
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
  const cardStateClassName = checked ? styles.allowed : styles.blocked;
  const toggleStateClassName = checked ? styles.toggleOn : styles.toggleOff;

  return (
    <div className={`${styles.card} ${cardStateClassName}`}>
      <div className={styles.header}>
        <Usb className={styles.headerIcon} />
        USB Control Status
      </div>

      <div className={styles.scene}>
        <div className={styles.hardwareGroup}>
          <div className={styles.statusCluster}>
            <div className={styles.statusLabel}>{statusText}</div>
            <div className={styles.statusIcon} aria-hidden="true">
              <img
                src={statusIconSrc}
                alt=""
                className={styles.statusIconImage}
              />
            </div>
          </div>

          <img
            src="/prototype-2/usb-cable-dark.svg"
            alt=""
            className={`${styles.cable} ${styles.assetDark}`}
            aria-hidden="true"
          />

          <img
            src="/prototype-2/laptop-dark.svg"
            alt=""
            className={`${styles.laptop} ${styles.assetDark}`}
            aria-hidden="true"
          />

          <img
            src="/prototype-2/usb-cable-light.svg"
            alt=""
            className={`${styles.cable} ${styles.assetLight}`}
            aria-hidden="true"
          />

          <img
            src="/prototype-2/laptop-light.svg"
            alt=""
            className={`${styles.laptop} ${styles.assetLight}`}
            aria-hidden="true"
          />
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
