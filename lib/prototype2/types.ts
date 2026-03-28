export type ThemeMode = "light" | "dark";

export type Prototype2Version = "ideal" | "final";

export type ProtectionLevel = "basic" | "enhanced" | "maximum";

export type QuarantineAction = "release" | "delete";

export type InstallerStage = "idle" | "form" | "progress" | "complete";

export type UsbTableView = "files-written" | "recent-devices";

export type UserRole = "Administrator" | "Security analyst" | "Standard user";

export type DeviceKind = "Workstation" | "Server" | "Mobile";

export type DevicePlatform = "Windows" | "MacOS" | "Linux" | "iOS" | "Android";

export type UsbCategoryId =
  | "audio-video"
  | "imaging"
  | "mass-storage"
  | "mobile"
  | "printer"
  | "wireless";

export type CanvasViewport = {
  x: number;
  y: number;
  scale: number;
};

export type ThemeState = {
  ideal: ThemeMode;
  final: ThemeMode;
};

export type InstallerState = {
  stage: InstallerStage;
  acceptedLicense: boolean;
  customerId: string;
  installationToken: string;
  progress: number;
  completed: boolean;
};

export type SummaryState = {
  statusLabel: string;
  deviceCount: number;
  licenseUsed: number;
  licenseTotal: number;
  threatsPrevented: number;
  detectionsPrevented: number;
  quickViewEnabled: boolean;
};

export type PreventionState = {
  level: ProtectionLevel;
};

export type QuarantineItem = {
  id: string;
  fileName: string;
  quarantinedAt: string;
  deviceId: string;
  x: number;
  y: number;
  radius: number;
  status: "quarantined" | "released" | "deleted";
};

export type QuarantineState = {
  action: QuarantineAction;
  totalFiles: number;
  items: QuarantineItem[];
};

export type UsbCategory = {
  id: UsbCategoryId;
  label: string;
  allow: boolean;
};

export type UsbFileRecord = {
  id: string;
  writtenAt: string;
  fileName: string;
  detectedType: string;
  usbDeviceName: string;
  deviceId: string;
};

export type UsbSeenRecord = {
  id: string;
  deviceName: string;
  vendor: string;
  connectedAt: string;
  lastUser: string;
  deviceId: string;
  allowListed?: boolean;
};

export type UsbControlState = {
  monitoringLabel: string;
  categories: UsbCategory[];
  tableView: UsbTableView;
  fileFilter: string;
  deviceFilter: string;
  dateRange: string;
  filesWritten: UsbFileRecord[];
  recentDevices: UsbSeenRecord[];
};

export type DeviceRecord = {
  id: string;
  name: string;
  firstDetected: boolean;
  type: DeviceKind;
  os: DevicePlatform;
  lastSeen: string;
  uninstallToken: string;
  groupId: string;
  status: "Connected" | "Connected recently";
  x: number;
  y: number;
};

export type DeviceGroup = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DevicesState = {
  search: string;
  items: DeviceRecord[];
};

export type DeviceGroupsState = {
  groups: DeviceGroup[];
  viewport: CanvasViewport;
};

export type UserRecord = {
  id: string;
  initials: string;
  name: string;
  email: string;
  accent: string;
  role: UserRole;
  rtrAccess?: boolean;
};

export type UsersState = {
  search: string;
  items: UserRecord[];
};

export type FinalOnboardingState = {
  devices: DeviceRecord[];
  users: UserRecord[];
};

export type Prototype2UiState = {
  finalNavOpen: boolean;
};

export type Prototype2DemoState = {
  theme: ThemeState;
  installer: InstallerState;
  summary: SummaryState;
  prevention: PreventionState;
  quarantine: QuarantineState;
  usbControl: UsbControlState;
  devices: DevicesState;
  deviceGroups: DeviceGroupsState;
  users: UsersState;
  finalOnboarding: FinalOnboardingState;
  ui: Prototype2UiState;
};
