export type Prototype2WindowsReturnTo = "ideal" | "final";

function buildWindowsDesktopHref(pathname: string, returnPath: string) {
  const params = new URLSearchParams({
    returnPath,
  });

  return `${pathname}?${params.toString()}`;
}

export function buildPrototype1WindowsDesktopHref(returnPath: string) {
  return buildWindowsDesktopHref("/prototype-1/windows-desktop", returnPath);
}

export function buildPrototype2WindowsDesktopHref(
  returnTo: Prototype2WindowsReturnTo,
  returnPath: string,
) {
  const params = new URLSearchParams({
    returnTo,
    returnPath,
  });

  return `/prototype-2/windows-desktop?${params.toString()}`;
}

export function resolveInternalReturnPath(
  returnPath: string | undefined,
  fallbackPath: string,
) {
  if (!returnPath) {
    return fallbackPath;
  }

  return returnPath.startsWith("/") ? returnPath : fallbackPath;
}
