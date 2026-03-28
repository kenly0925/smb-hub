"use client";

import {
  createInitialDeviceGroupsState,
  createInitialFinalOnboardingState,
  createInitialPrototype2State,
  createInstalledPrototype2Device,
} from "@/lib/prototype2/data";
import {
  DeviceGroup,
  Prototype2DemoState,
  Prototype2Version,
  ProtectionLevel,
  QuarantineAction,
  ThemeMode,
  UsbCategoryId,
  UsbTableView,
  UserRole,
} from "@/lib/prototype2/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Prototype2DemoContextValue = {
  state: Prototype2DemoState;
  setTheme: (version: Prototype2Version, mode: ThemeMode) => void;
  setFinalNavOpen: (open: boolean) => void;
  toggleFinalNav: () => void;
  setInstallerStage: (stage: Prototype2DemoState["installer"]["stage"]) => void;
  setInstallerAcceptedLicense: (accepted: boolean) => void;
  setInstallerField: (
    field: "customerId" | "installationToken",
    value: string,
  ) => void;
  setInstallerProgress: (progress: number) => void;
  completeInstallation: (version: Prototype2Version) => void;
  setProtectionLevel: (level: ProtectionLevel) => void;
  setQuarantineAction: (action: QuarantineAction) => void;
  releaseQuarantineItem: (id: string) => void;
  deleteQuarantineItem: (id: string) => void;
  toggleUsbCategory: (id: UsbCategoryId) => void;
  allowListUsbDevice: (id: string) => void;
  setUsbTableView: (view: UsbTableView) => void;
  setQuickViewEnabled: (enabled: boolean) => void;
  createDeviceGroup: (group: DeviceGroup) => void;
  renameDeviceGroup: (groupId: string, name: string) => void;
  moveDeviceToGroup: (deviceId: string, groupId: string) => void;
  setDeviceSearch: (value: string) => void;
  setUserSearch: (value: string) => void;
  setUserRole: (userId: string, role: UserRole) => void;
  resetDemo: () => void;
};

const STORAGE_KEY = "smb-hub-prototype-2-demo-state";

const Prototype2DemoContext = createContext<Prototype2DemoContextValue | null>(
  null,
);

function loadStoredState() {
  const initialState = createInitialPrototype2State();

  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return initialState;
    }

    const parsedState = JSON.parse(storedValue) as Prototype2DemoState;

    return {
      ...initialState,
      ...parsedState,
      users: {
        ...initialState.users,
        ...parsedState.users,
        items: (parsedState.users?.items ?? initialState.users.items).map(
          (user, index) =>
            index === 0 || user.id === "u1"
              ? { ...user, rtrAccess: false }
              : user,
        ),
      },
      finalOnboarding: {
        ...createInitialFinalOnboardingState(),
        ...parsedState.finalOnboarding,
      },
    };
  } catch {
    return initialState;
  }
}

function updateQuarantineItem(
  state: Prototype2DemoState,
  id: string,
  status: "released" | "deleted",
) {
  const item = state.quarantine.items.find((candidate) => candidate.id === id);

  if (!item || item.status !== "quarantined") {
    return state;
  }

  return {
    ...state,
    quarantine: {
      ...state.quarantine,
      totalFiles: Math.max(0, state.quarantine.totalFiles - 1),
      items: state.quarantine.items.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate,
      ),
    },
  };
}

export function Prototype2DemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<Prototype2DemoState>(() =>
    createInitialPrototype2State(),
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

  const value = useMemo<Prototype2DemoContextValue>(
    () => ({
      state,
      setTheme: (version, mode) =>
        setState((current) => ({
          ...current,
          theme: {
            ...current.theme,
            [version]: mode,
          },
        })),
      setFinalNavOpen: (open) =>
        setState((current) => ({
          ...current,
          ui: {
            ...current.ui,
            finalNavOpen: open,
          },
        })),
      toggleFinalNav: () =>
        setState((current) => ({
          ...current,
          ui: {
            ...current.ui,
            finalNavOpen: !current.ui.finalNavOpen,
          },
        })),
      setInstallerStage: (stage) =>
        setState((current) => ({
          ...current,
          installer: {
            ...current.installer,
            stage,
          },
        })),
      setInstallerAcceptedLicense: (acceptedLicense) =>
        setState((current) => ({
          ...current,
          installer: {
            ...current.installer,
            acceptedLicense,
          },
        })),
      setInstallerField: (field, value) =>
        setState((current) => ({
          ...current,
          installer: {
            ...current.installer,
            [field]: value,
          },
        })),
      setInstallerProgress: (progress) =>
        setState((current) => ({
          ...current,
          installer: {
            ...current.installer,
            progress,
          },
        })),
      completeInstallation: (version) =>
        setState((current) => {
          if (current.installer.completed) {
            return current;
          }

          const installedDevice = createInstalledPrototype2Device();

          if (version === "final") {
            return {
              ...current,
              installer: {
                ...current.installer,
                completed: true,
                stage: "complete",
                progress: 100,
              },
              finalOnboarding: {
                ...current.finalOnboarding,
                devices: [installedDevice, ...current.finalOnboarding.devices],
              },
            };
          }

          return {
            ...current,
            installer: {
              ...current.installer,
              completed: true,
              stage: "complete",
              progress: 100,
            },
            summary: {
              ...current.summary,
              deviceCount: current.summary.deviceCount + 1,
              licenseUsed: Math.min(
                current.summary.licenseTotal,
                current.summary.licenseUsed + 1,
              ),
            },
            devices: {
              ...current.devices,
              items: [installedDevice, ...current.devices.items],
            },
          };
        }),
      setProtectionLevel: (level) =>
        setState((current) => ({
          ...current,
          prevention: {
            level,
          },
        })),
      setQuarantineAction: (action) =>
        setState((current) => ({
          ...current,
          quarantine: {
            ...current.quarantine,
            action,
          },
        })),
      releaseQuarantineItem: (id) =>
        setState((current) => updateQuarantineItem(current, id, "released")),
      deleteQuarantineItem: (id) =>
        setState((current) => updateQuarantineItem(current, id, "deleted")),
      toggleUsbCategory: (id) =>
        setState((current) => ({
          ...current,
          usbControl: {
            ...current.usbControl,
            categories: current.usbControl.categories.map((category) =>
              category.id === id
                ? {
                    ...category,
                    allow: !category.allow,
                  }
                : category,
            ),
          },
        })),
      allowListUsbDevice: (id) =>
        setState((current) => ({
          ...current,
          usbControl: {
            ...current.usbControl,
            recentDevices: current.usbControl.recentDevices.map((device) =>
              device.id === id ? { ...device, allowListed: true } : device,
            ),
          },
        })),
      setUsbTableView: (tableView) =>
        setState((current) => ({
          ...current,
          usbControl: {
            ...current.usbControl,
            tableView,
          },
        })),
      setQuickViewEnabled: (quickViewEnabled) =>
        setState((current) => ({
          ...current,
          summary: {
            ...current.summary,
            quickViewEnabled,
          },
        })),
      createDeviceGroup: (group) =>
        setState((current) => ({
          ...current,
          deviceGroups: {
            ...current.deviceGroups,
            groups: [...current.deviceGroups.groups, group],
          },
        })),
      renameDeviceGroup: (groupId, name) =>
        setState((current) => ({
          ...current,
          deviceGroups: {
            ...current.deviceGroups,
            groups: current.deviceGroups.groups.map((group) =>
              group.id === groupId ? { ...group, name } : group,
            ),
          },
        })),
      moveDeviceToGroup: (deviceId, groupId) =>
        setState((current) => ({
          ...current,
          devices: {
            ...current.devices,
            items: current.devices.items.map((device) =>
              device.id === deviceId ? { ...device, groupId } : device,
            ),
          },
        })),
      setDeviceSearch: (search) =>
        setState((current) => ({
          ...current,
          devices: {
            ...current.devices,
            search,
          },
        })),
      setUserSearch: (search) =>
        setState((current) => ({
          ...current,
          users: {
            ...current.users,
            search,
          },
        })),
      setUserRole: (userId, role) =>
        setState((current) => ({
          ...current,
          users: {
            ...current.users,
            items: current.users.items.map((user) =>
              user.id === userId ? { ...user, role } : user,
            ),
          },
        })),
      resetDemo: () =>
        setState({
          ...createInitialPrototype2State(),
          deviceGroups: createInitialDeviceGroupsState(),
        }),
    }),
    [state],
  );

  return (
    <Prototype2DemoContext.Provider value={value}>
      {children}
    </Prototype2DemoContext.Provider>
  );
}

export function usePrototype2Demo() {
  const context = useContext(Prototype2DemoContext);

  if (!context) {
    throw new Error("usePrototype2Demo must be used within the provider");
  }

  return context;
}
