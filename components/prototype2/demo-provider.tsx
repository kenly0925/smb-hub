"use client";

import {
  createInitialDeviceGroupsState,
  createInitialFinalOnboardingState,
  createInitialPrototype2State,
  createInstalledPrototype2Device,
} from "@/lib/prototype2/data";
import {
  DeviceGroup,
  FinalOnboardingStage,
  Prototype2DemoState,
  TodoTaskId,
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
  dismissTodo: (version: Prototype2Version, taskId: TodoTaskId) => void;
  setFinalOnboardingStage: (stage: FinalOnboardingStage) => void;
  setFinalOnboardingProgress: (progress: number) => void;
  completeFinalOnboarding: () => void;
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
  resetQuarantineItems: () => void;
  toggleUsbCategory: (id: UsbCategoryId) => void;
  setAllUsbCategories: (allow: boolean) => void;
  allowListUsbDevice: (id: string) => void;
  setUsbTableView: (view: UsbTableView) => void;
  setQuickViewEnabled: (enabled: boolean) => void;
  createDeviceGroup: (group: DeviceGroup) => void;
  renameDeviceGroup: (groupId: string, name: string) => void;
  setDeviceGroupRestricted: (groupId: string, restricted: boolean) => void;
  updateDeviceGroupLayout: (
    groupId: string,
    updates: Partial<Pick<DeviceGroup, "x" | "y" | "width" | "height">>,
  ) => void;
  deleteDeviceGroup: (groupId: string) => void;
  moveDeviceToGroup: (deviceId: string, groupId: string) => void;
  updateDevicePlacements: (
    updates: Array<{
      id: string;
      groupId?: string;
      x: number;
      y: number;
      positionPinned?: boolean;
    }>,
  ) => void;
  setDeviceSearch: (value: string) => void;
  setUserSearch: (value: string) => void;
  setUserRole: (userId: string, role: UserRole) => void;
  resetDemo: () => void;
};

const STORAGE_KEY = "smb-hub-prototype-2-demo-state";

const LEGACY_USB_DEFAULTS: Record<UsbCategoryId, boolean> = {
  "audio-video": true,
  imaging: false,
  "mass-storage": true,
  mobile: true,
  printer: true,
  wireless: false,
};

const LEGACY_QUARANTINE_FILE_NAMES = [
  "Draft1-changes-in-red-from-Simon.doc",
  "ATTACHEMENT 836128956.html",
  "FunnyMemeOMG.gif",
  "legal-tenure.pdf",
  "Scann_158.pdf",
  "forward statement item 2.txt",
  "Ghost-audio.wav",
  "printer_helper.pkg",
];

const LEGACY_USB_FILE_NAMES = [
  "Scann_158.pdf",
  "forward statement item 2.txt",
  "Book 1(1).xls",
  "ATTACHEMENT 836128956.html",
  "Sheet 1.xls",
  "legal-tenure.pdf",
];

const LEGACY_USB_DEVICE_NAMES = [
  "SanDisk Cruzer CZ36",
  "Samsung Fit Plus",
  "Kingston DataTraveler G4",
  "Corsair Flash Survivor",
];

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
    const parsedFinalDevices = parsedState.finalOnboarding?.devices ?? [];
    const hasCompletedFinalInstall =
      parsedState.installer?.completed || parsedFinalDevices.length > 0;
    const migratedFinalStage =
      parsedState.finalOnboarding?.stage ??
      (hasCompletedFinalInstall ? "complete" : "confirm-user");
    const migratedFinalProgress =
      parsedState.finalOnboarding?.configurationProgress ??
      (migratedFinalStage === "complete" ? 100 : 0);
    const parsedUsbCategories = parsedState.usbControl?.categories;
    const usesLegacyUsbDefaults =
      parsedUsbCategories?.length === initialState.usbControl.categories.length &&
      initialState.usbControl.categories.every((category) => {
        const storedCategory = parsedUsbCategories.find(
          (candidate) => candidate.id === category.id,
        );

        return (
          (storedCategory?.allow ?? category.allow) === LEGACY_USB_DEFAULTS[category.id]
        );
      });
    const migratedUsbCategories = usesLegacyUsbDefaults
      ? initialState.usbControl.categories
      : parsedUsbCategories ?? initialState.usbControl.categories;
    const parsedQuarantineItems = parsedState.quarantine?.items;
    const usesLegacyQuarantinePlaceholders =
      parsedQuarantineItems?.length === LEGACY_QUARANTINE_FILE_NAMES.length &&
      parsedQuarantineItems.every((item, index) => item.fileName === LEGACY_QUARANTINE_FILE_NAMES[index]);
    const migratedQuarantineItems = usesLegacyQuarantinePlaceholders
      ? initialState.quarantine.items.map((item) => {
          const storedItem = parsedQuarantineItems.find(
            (candidate) => candidate.id === item.id,
          );

          return storedItem ? { ...item, status: storedItem.status } : item;
        })
      : parsedQuarantineItems ?? initialState.quarantine.items;
    const parsedUsbFiles = parsedState.usbControl?.filesWritten;
    const usesLegacyUsbFilePlaceholders =
      parsedUsbFiles?.length === LEGACY_USB_FILE_NAMES.length &&
      parsedUsbFiles.every((item, index) => item.fileName === LEGACY_USB_FILE_NAMES[index]);
    const migratedUsbFiles =
      usesLegacyUsbFilePlaceholders ||
      !parsedUsbFiles ||
      parsedUsbFiles.length < initialState.usbControl.filesWritten.length
        ? initialState.usbControl.filesWritten
        : parsedUsbFiles;
    const parsedSeenDevices = parsedState.usbControl?.recentDevices;
    const usesLegacySeenDevicePlaceholders =
      parsedSeenDevices?.length === LEGACY_USB_DEVICE_NAMES.length &&
      parsedSeenDevices.every(
        (item, index) => item.deviceName === LEGACY_USB_DEVICE_NAMES[index],
      );
    const migratedSeenDevices = usesLegacySeenDevicePlaceholders
      ? initialState.usbControl.recentDevices.map((item) => {
          const storedDevice = parsedSeenDevices.find(
            (candidate) => candidate.id === item.id,
          );

          return storedDevice
            ? { ...item, allowListed: storedDevice.allowListed ?? item.allowListed }
            : item;
        })
      : parsedSeenDevices ?? initialState.usbControl.recentDevices;

    return {
      ...initialState,
      ...parsedState,
      quarantine: {
        ...initialState.quarantine,
        ...parsedState.quarantine,
        items: migratedQuarantineItems,
      },
      usbControl: {
        ...initialState.usbControl,
        ...parsedState.usbControl,
        categories: migratedUsbCategories,
        filesWritten: migratedUsbFiles,
        recentDevices: migratedSeenDevices,
      },
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
        ...createInitialFinalOnboardingState({
          stage: migratedFinalStage,
          configurationProgress: migratedFinalProgress,
        }),
        ...parsedState.finalOnboarding,
        devices: parsedFinalDevices,
        stage: migratedFinalStage,
        configurationProgress: migratedFinalProgress,
      },
      ui: {
        ...initialState.ui,
        ...parsedState.ui,
        dismissedTodos: {
          ideal:
            parsedState.ui?.dismissedTodos?.ideal ??
            initialState.ui.dismissedTodos.ideal,
          final:
            parsedState.ui?.dismissedTodos?.final ??
            initialState.ui.dismissedTodos.final,
        },
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

function resetQuarantineItems(state: Prototype2DemoState) {
  return {
    ...state,
    quarantine: {
      ...state.quarantine,
      totalFiles: state.quarantine.items.length,
      items: state.quarantine.items.map((item) => ({
        ...item,
        status: "quarantined" as const,
      })),
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

  const actions = useMemo<Omit<Prototype2DemoContextValue, "state">>(
    () => ({
      setTheme: (version, mode) =>
        setState((current) => ({
          ...current,
          theme: {
            ...current.theme,
            [version]: mode,
          },
        })),
      dismissTodo: (version, taskId) =>
        setState((current) => ({
          ...current,
          ui: {
            ...current.ui,
            dismissedTodos: {
              ...current.ui.dismissedTodos,
              [version]: current.ui.dismissedTodos[version].includes(taskId)
                ? current.ui.dismissedTodos[version]
                : [...current.ui.dismissedTodos[version], taskId],
            },
          },
        })),
      setFinalOnboardingStage: (stage) =>
        setState((current) => ({
          ...current,
          finalOnboarding: {
            ...current.finalOnboarding,
            stage,
          },
        })),
      setFinalOnboardingProgress: (configurationProgress) =>
        setState((current) => ({
          ...current,
          finalOnboarding: {
            ...current.finalOnboarding,
            configurationProgress,
          },
        })),
      completeFinalOnboarding: () =>
        setState((current) => ({
          ...current,
          finalOnboarding: {
            ...current.finalOnboarding,
            stage: "complete",
            configurationProgress: 100,
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
                devices: current.finalOnboarding.devices.some(
                  (device) => device.id === installedDevice.id,
                )
                  ? current.finalOnboarding.devices
                  : [installedDevice, ...current.finalOnboarding.devices],
                stage: "configuring",
                configurationProgress: Math.max(
                  current.finalOnboarding.configurationProgress,
                  18,
                ),
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
        setState((current) =>
          current.quarantine.action === action
            ? current
            : {
                ...current,
                quarantine: {
                  ...current.quarantine,
                  action,
                },
              },
        ),
      releaseQuarantineItem: (id) =>
        setState((current) => updateQuarantineItem(current, id, "released")),
      deleteQuarantineItem: (id) =>
        setState((current) => updateQuarantineItem(current, id, "deleted")),
      resetQuarantineItems: () =>
        setState((current) => resetQuarantineItems(current)),
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
      setAllUsbCategories: (allow) =>
        setState((current) => ({
          ...current,
          usbControl: {
            ...current.usbControl,
            categories: current.usbControl.categories.map((category) => ({
              ...category,
              allow,
            })),
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
      setDeviceGroupRestricted: (groupId, restricted) =>
        setState((current) => ({
          ...current,
          deviceGroups: {
            ...current.deviceGroups,
            groups: current.deviceGroups.groups.map((group) =>
              group.id === groupId ? { ...group, restricted } : group,
            ),
          },
        })),
      updateDeviceGroupLayout: (groupId, updates) =>
        setState((current) => ({
          ...current,
          deviceGroups: {
            ...current.deviceGroups,
            groups: current.deviceGroups.groups.map((group) =>
              group.id === groupId ? { ...group, ...updates } : group,
            ),
          },
        })),
      deleteDeviceGroup: (groupId) =>
        setState((current) => {
          if (groupId === "all-devices") {
            return current;
          }

          return {
            ...current,
            deviceGroups: {
              ...current.deviceGroups,
              groups: current.deviceGroups.groups.filter((group) => group.id !== groupId),
            },
            devices: {
              ...current.devices,
              items: current.devices.items.map((device) =>
                device.groupId === groupId
                  ? {
                      ...device,
                      groupId: "all-devices",
                    }
                  : device,
              ),
            },
          };
        }),
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
      updateDevicePlacements: (updates) =>
        setState((current) => {
          const updateMap = new Map(updates.map((update) => [update.id, update]));

          return {
            ...current,
            devices: {
              ...current.devices,
              items: current.devices.items.map((device) => {
                const update = updateMap.get(device.id);

                if (!update) {
                  return device;
                }

                return {
                  ...device,
                  groupId: update.groupId ?? device.groupId,
                  x: update.x,
                  y: update.y,
                  positionPinned: update.positionPinned ?? device.positionPinned,
                };
              }),
            },
          };
        }),
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
    [],
  );

  const value = useMemo<Prototype2DemoContextValue>(
    () => ({
      state,
      ...actions,
    }),
    [actions, state],
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
