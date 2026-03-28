import { ProtectionLevel, UsbCategoryId } from "@/lib/prototype2/types";

export function formatProtectionLevel(level: ProtectionLevel) {
  if (level === "basic") {
    return "Basic";
  }

  if (level === "enhanced") {
    return "Enhanced";
  }

  return "Maximum";
}

export function getProtectionShieldSrc(
  _level: ProtectionLevel,
  statusLabel: string,
  options?: { animated?: boolean },
) {
  const normalizedStatus = statusLabel.toLowerCase();
  const suffix = options?.animated ? "gif" : "png";

  if (
    normalizedStatus.includes("custom") ||
    normalizedStatus.includes("unconfigured")
  ) {
    return `/prototype-2/shields/shield-custom-policy.${suffix}`;
  }

  if (normalizedStatus.includes("no")) {
    return `/prototype-2/shields/shield-no-protection.${suffix}`;
  }

  return `/prototype-2/shields/shield-protected.${suffix}`;
}

const usbControlIconPaths: Record<
  UsbCategoryId,
  { allowed: string; disallowed: string }
> = {
  "audio-video": {
    allowed: "/prototype-2/usb-control-icons/device-control-icon-audio-allowed.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-audio-disallowed.svg",
  },
  imaging: {
    allowed: "/prototype-2/usb-control-icons/device-control-icon-image-allowed.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-image-disallowed.svg",
  },
  "mass-storage": {
    allowed:
      "/prototype-2/usb-control-icons/device-control-icon-mass-storage-allowe.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-mass-storage-disallowed.svg",
  },
  mobile: {
    allowed: "/prototype-2/usb-control-icons/device-control-icon-mobile-allowed.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-mobile-disallowed.svg",
  },
  printer: {
    allowed:
      "/prototype-2/usb-control-icons/device-control-icon-printer-allowed.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-printer-disallowed.svg",
  },
  wireless: {
    allowed:
      "/prototype-2/usb-control-icons/device-control-icon-wireless-allowed.svg",
    disallowed:
      "/prototype-2/usb-control-icons/device-control-icon-wireless-disallowed.svg",
  },
};

export function getUsbControlIconSrc(id: UsbCategoryId, allow: boolean) {
  return allow ? usbControlIconPaths[id].allowed : usbControlIconPaths[id].disallowed;
}
