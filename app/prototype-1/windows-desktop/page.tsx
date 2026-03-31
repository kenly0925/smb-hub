import { Prototype1WindowsDesktopPage } from "@/components/prototype1/windows-desktop-page";
import { resolveInternalReturnPath } from "@/lib/windows-desktop";

export default async function WindowsDesktopPage({
  searchParams,
}: {
  searchParams: Promise<{ returnPath?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const returnPath = resolveInternalReturnPath(
    resolvedSearchParams.returnPath,
    "/prototype-1/sensors",
  );

  return <Prototype1WindowsDesktopPage returnPath={returnPath} />;
}
