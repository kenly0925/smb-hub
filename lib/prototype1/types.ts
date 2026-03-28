export type PolicyLevel =
  | "disabled"
  | "cautious"
  | "moderate"
  | "aggressive"
  | "extra-aggressive";

export type CredentialsField = "customerId" | "installationToken";

export type ToggleItem = {
  id: string;
  label: string;
  enabled: boolean;
  description?: string;
};

export type PolicyConfig = {
  assignedHostGroups: string[];
  sensorMachineLearning: {
    sensorAntiMalware: {
      detection: PolicyLevel;
      prevention: PolicyLevel;
    };
    adwareAndPup: {
      detection: PolicyLevel;
      prevention: PolicyLevel;
    };
  };
  quarantine: {
    enableAll: boolean;
    items: ToggleItem[];
  };
  executionBlocking: ToggleItem[];
  visibilityAndScripts: ToggleItem[];
  responseAndExceptions: {
    unknownBinaryResponse: "Prevent" | "Detect" | "Observe";
    scriptAnalysisDepth: "Standard" | "Enhanced" | "Maximum";
    quarantineArchiveAttachments: boolean;
    blockCredentialDumping: boolean;
    notifyOnPrevention: boolean;
    allowAnalystOverride: boolean;
  };
  advancedControls: {
    osquery: boolean;
    scripts: boolean;
    cpuThrottleValue: number;
    cpuThrottleUnit: "%" | "Cores";
    memoryAllocationValue: number;
    memoryAllocationUnit: "MB" | "GB";
    executionTimeoutValue: number;
    executionTimeoutUnit: "Hours" | "Minutes";
    rateLimiting: boolean;
  };
};

export type PolicySummary = {
  id: string;
  name: string;
  status: "Enabled" | "Disabled";
  createdAt: string;
  lastModified: string;
  appliedTo: string;
  precedence: number;
  platform: "Windows" | "MacOS" | "Linux";
};

export type InstalledHost = {
  id: string;
  hostname: string;
  username: string;
  platform: string;
  sensorVersion: string;
  lastSeen: string;
  ipAddress: string;
  hostGroups: string;
  deviceId: string;
  status: "Connected" | "Disconnected";
};

export type Detection = {
  id: string;
  severity: "Low" | "Medium" | "High";
  tactic: string;
  time: string;
  hostId: string;
  linkLabel: string;
};

export type Prototype1DemoState = {
  credentials: {
    customerId: string;
    installationToken: string;
    customerIdVisible: boolean;
    installationTokenVisible: boolean;
  };
  hosts: InstalledHost[];
  detections: Detection[];
  policySummaries: PolicySummary[];
  policyConfigDraft: PolicyConfig;
  policyConfigSaved: PolicyConfig;
  uiFlags: {
    navOpen: boolean;
  };
  demoFlags: {
    installerCompleted: boolean;
    detectionTriggered: boolean;
  };
};
