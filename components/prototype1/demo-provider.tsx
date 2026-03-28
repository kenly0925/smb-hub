"use client";

import {
  createDetection,
  createInitialPrototype1State,
  createInstalledHost,
} from "@/lib/prototype1/data";
import {
  CredentialsField,
  PolicyConfig,
  Prototype1DemoState,
} from "@/lib/prototype1/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Prototype1DemoContextValue = {
  state: Prototype1DemoState;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
  toggleCredentialVisibility: (field: CredentialsField) => void;
  completeInstallation: () => void;
  triggerFakeDetection: () => void;
  updatePolicyConfig: (updater: (draft: PolicyConfig) => PolicyConfig) => void;
  savePolicyConfig: () => void;
  resetPolicyConfig: () => void;
  resetDemo: () => void;
};

const STORAGE_KEY = "smb-hub-prototype-1-demo-state";

const Prototype1DemoContext = createContext<Prototype1DemoContextValue | null>(
  null,
);

function clonePolicyConfig(config: PolicyConfig) {
  return structuredClone(config);
}

function mergePolicyConfig(
  defaults: PolicyConfig,
  stored?: Partial<PolicyConfig>,
): PolicyConfig {
  return {
    ...defaults,
    ...stored,
    assignedHostGroups: stored?.assignedHostGroups ?? defaults.assignedHostGroups,
    sensorMachineLearning: {
      ...defaults.sensorMachineLearning,
      ...stored?.sensorMachineLearning,
      sensorAntiMalware: {
        ...defaults.sensorMachineLearning.sensorAntiMalware,
        ...stored?.sensorMachineLearning?.sensorAntiMalware,
      },
      adwareAndPup: {
        ...defaults.sensorMachineLearning.adwareAndPup,
        ...stored?.sensorMachineLearning?.adwareAndPup,
      },
    },
    quarantine: {
      ...defaults.quarantine,
      ...stored?.quarantine,
      items: stored?.quarantine?.items ?? defaults.quarantine.items,
    },
    executionBlocking:
      stored?.executionBlocking ?? defaults.executionBlocking,
    visibilityAndScripts:
      stored?.visibilityAndScripts ?? defaults.visibilityAndScripts,
    responseAndExceptions: {
      ...defaults.responseAndExceptions,
      ...stored?.responseAndExceptions,
    },
    advancedControls: {
      ...defaults.advancedControls,
      ...stored?.advancedControls,
    },
  };
}

function loadStoredState() {
  if (typeof window === "undefined") {
    return createInitialPrototype1State();
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return createInitialPrototype1State();
    }

    const defaults = createInitialPrototype1State();
    const storedState = JSON.parse(storedValue) as Partial<Prototype1DemoState>;

    return {
      ...defaults,
      ...storedState,
      credentials: {
        ...defaults.credentials,
        ...storedState.credentials,
      },
      hosts: storedState.hosts ?? defaults.hosts,
      detections: storedState.detections ?? defaults.detections,
      policySummaries: storedState.policySummaries ?? defaults.policySummaries,
      policyConfigDraft: mergePolicyConfig(
        defaults.policyConfigDraft,
        storedState.policyConfigDraft,
      ),
      policyConfigSaved: mergePolicyConfig(
        defaults.policyConfigSaved,
        storedState.policyConfigSaved,
      ),
      uiFlags: {
        ...defaults.uiFlags,
        ...storedState.uiFlags,
      },
      demoFlags: {
        ...defaults.demoFlags,
        ...storedState.demoFlags,
      },
    };
  } catch {
    return createInitialPrototype1State();
  }
}

export function Prototype1DemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<Prototype1DemoState>(() =>
    createInitialPrototype1State(),
  );
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setState(loadStoredState());
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hasLoaded, state]);

  const value = useMemo<Prototype1DemoContextValue>(
    () => ({
      state,
      setNavOpen: (open) =>
        setState((current) => ({
          ...current,
          uiFlags: {
            ...current.uiFlags,
            navOpen: open,
          },
        })),
      toggleNav: () =>
        setState((current) => ({
          ...current,
          uiFlags: {
            ...current.uiFlags,
            navOpen: !current.uiFlags.navOpen,
          },
        })),
      toggleCredentialVisibility: (field) =>
        setState((current) => ({
          ...current,
          credentials: {
            ...current.credentials,
            customerIdVisible:
              field === "customerId"
                ? !current.credentials.customerIdVisible
                : current.credentials.customerIdVisible,
            installationTokenVisible:
              field === "installationToken"
                ? !current.credentials.installationTokenVisible
                : current.credentials.installationTokenVisible,
          },
        })),
      completeInstallation: () =>
        setState((current) => {
          if (current.demoFlags.installerCompleted) {
            return current;
          }

          return {
            ...current,
            hosts: [createInstalledHost()],
            demoFlags: {
              ...current.demoFlags,
              installerCompleted: true,
            },
          };
        }),
      triggerFakeDetection: () =>
        setState((current) => {
          if (current.demoFlags.detectionTriggered) {
            return current;
          }

          return {
            ...current,
            detections: [createDetection()],
            demoFlags: {
              ...current.demoFlags,
              detectionTriggered: true,
            },
          };
        }),
      updatePolicyConfig: (updater) =>
        setState((current) => ({
          ...current,
          policyConfigDraft: updater(clonePolicyConfig(current.policyConfigDraft)),
        })),
      savePolicyConfig: () =>
        setState((current) => ({
          ...current,
          policyConfigSaved: clonePolicyConfig(current.policyConfigDraft),
        })),
      resetPolicyConfig: () =>
        setState((current) => ({
          ...current,
          policyConfigDraft: clonePolicyConfig(current.policyConfigSaved),
        })),
      resetDemo: () => setState(createInitialPrototype1State()),
    }),
    [state],
  );

  return (
    <Prototype1DemoContext.Provider value={value}>
      {children}
    </Prototype1DemoContext.Provider>
  );
}

export function usePrototype1Demo() {
  const context = useContext(Prototype1DemoContext);

  if (!context) {
    throw new Error("usePrototype1Demo must be used within the provider");
  }

  return context;
}
