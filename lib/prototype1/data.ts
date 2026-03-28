import {
  Detection,
  InstalledHost,
  PolicyConfig,
  PolicySummary,
  Prototype1DemoState,
} from "@/lib/prototype1/types";

export const LEVEL_OPTIONS = [
  { label: "Disabled", value: "disabled" },
  { label: "Cautious", value: "cautious" },
  { label: "Moderate", value: "moderate" },
  { label: "Aggressive", value: "aggressive" },
  { label: "Extra Aggressive", value: "extra-aggressive" },
] as const;

export const POLICY_SUMMARIES: PolicySummary[] = [
  {
    id: "phase-1",
    name: "Phase 1",
    status: "Disabled",
    createdAt: "2025-08-25 14:12",
    lastModified: "2025-08-25 14:12",
    appliedTo: "1 host group",
    precedence: 1,
    platform: "Windows",
  },
  {
    id: "phase-2",
    name: "Phase 2",
    status: "Disabled",
    createdAt: "2025-08-25 14:12",
    lastModified: "2025-08-25 14:12",
    appliedTo: "1 host group",
    precedence: 2,
    platform: "Windows",
  },
  {
    id: "phase-3",
    name: "Phase 3",
    status: "Disabled",
    createdAt: "2025-08-25 14:12",
    lastModified: "2025-08-25 14:12",
    appliedTo: "1 host group",
    precedence: 3,
    platform: "Windows",
  },
];

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  assignedHostGroups: ["Default", "Windows Pilot", "Finance Workstations"],
  sensorMachineLearning: {
    sensorAntiMalware: {
      detection: "aggressive",
      prevention: "aggressive",
    },
    adwareAndPup: {
      detection: "aggressive",
      prevention: "aggressive",
    },
  },
  quarantine: {
    enableAll: true,
    items: [
      {
        id: "quarantine-malware",
        label: "Quarantine malware and ransomware",
        enabled: true,
        description: "Isolate malicious payloads when prevention blocks execution.",
      },
      {
        id: "quarantine-suspicious-files",
        label: "Quarantine suspicious executables",
        enabled: true,
        description: "Hold new executables for analyst review.",
      },
      {
        id: "quarantine-remediation",
        label: "Retain remediation artifacts",
        enabled: true,
        description: "Preserve forensic evidence for later validation.",
      },
    ],
  },
  executionBlocking: [
    {
      id: "suspicious-processes",
      label: "Suspicious processes",
      enabled: true,
      description: "Block behaviors associated with malware staging and execution.",
    },
    {
      id: "suspicious-scripts",
      label: "Suspicious scripts and commands",
      enabled: true,
      description: "Harden PowerShell, cmd, and interpreter misuse patterns.",
    },
    {
      id: "registry-ops",
      label: "Suspicious registry operations",
      enabled: true,
      description: "Prevent persistence changes linked to known attack chains.",
    },
    {
      id: "custom-ioc",
      label: "Custom indicator blocking",
      enabled: true,
      description: "Apply organization-specific deny rules to matching payloads.",
    },
    {
      id: "kernel-drivers",
      label: "Suspicious kernel drivers",
      enabled: true,
      description: "Prevent driver-based tampering and stealth loading techniques.",
    },
    {
      id: "vulnerable-drivers",
      label: "Vulnerable driver protection",
      enabled: false,
      description: "Detect or prevent abuse of known vulnerable signed drivers.",
    },
  ],
  visibilityAndScripts: [
    {
      id: "script-monitoring",
      label: "Script-based execution monitoring",
      enabled: true,
      description: "Increase telemetry for script interpreters and inline execution.",
    },
    {
      id: "interpreter-only",
      label: "Interpreter-only mode",
      enabled: false,
      description: "Limit deep script inspection to supported interpreters only.",
    },
    {
      id: "engine-visibility",
      label: "Engine visibility",
      enabled: true,
      description: "Collect AMSI-like script content and execution context.",
    },
    {
      id: "http-detections",
      label: "HTTP detections",
      enabled: true,
      description: "Flag suspicious download and beaconing patterns over HTTP/S.",
    },
    {
      id: "user-mode-data",
      label: "Additional user mode data",
      enabled: true,
      description: "Capture supporting telemetry for analyst triage and response.",
    },
  ],
  responseAndExceptions: {
    unknownBinaryResponse: "Prevent",
    scriptAnalysisDepth: "Enhanced",
    quarantineArchiveAttachments: true,
    blockCredentialDumping: true,
    notifyOnPrevention: true,
    allowAnalystOverride: false,
  },
  advancedControls: {
    osquery: true,
    scripts: true,
    cpuThrottleValue: 100,
    cpuThrottleUnit: "%",
    memoryAllocationValue: 256,
    memoryAllocationUnit: "MB",
    executionTimeoutValue: 2,
    executionTimeoutUnit: "Hours",
    rateLimiting: true,
  },
};

export function createInstalledHost(): InstalledHost {
  return {
    id: "host-win-fin-001",
    hostname: "WIN-FIN-001",
    username: "kenly",
    platform: "Windows 11",
    sensorVersion: "7.13.1502",
    lastSeen: "2025-08-25 14:12",
    ipAddress: "10.14.22.87",
    hostGroups: "Default",
    deviceId: "9f1c3a2e-7b64-4d0d",
    status: "Connected",
  };
}

export function createDetection(): Detection {
  return {
    id: "det-1",
    severity: "Low",
    tactic: "Defense Evasion via Direct PowerShell Execution",
    time: "Jun 7, 2025 00:06:10",
    hostId: "W11X64",
    linkLabel: "See detection",
  };
}

export function createInitialPrototype1State(): Prototype1DemoState {
  return {
    credentials: {
      customerId: "12345678-90ab-cdef-1234-567890abcdef-12",
      installationToken: "f-9.000-0000-0000-0000",
      customerIdVisible: false,
      installationTokenVisible: false,
    },
    hosts: [],
    detections: [],
    policySummaries: POLICY_SUMMARIES,
    policyConfigDraft: structuredClone(DEFAULT_POLICY_CONFIG),
    policyConfigSaved: structuredClone(DEFAULT_POLICY_CONFIG),
    uiFlags: {
      navOpen: false,
    },
    demoFlags: {
      installerCompleted: false,
      detectionTriggered: false,
    },
  };
}
