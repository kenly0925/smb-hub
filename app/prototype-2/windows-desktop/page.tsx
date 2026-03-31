import { Prototype2WindowsDesktopPage } from "@/components/prototype2/windows-desktop-page";
import { resolveInternalReturnPath } from "@/lib/windows-desktop";

export default async function Prototype2WindowsDesktopRoute({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; returnPath?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const returnTo =
    resolvedSearchParams.returnTo === "ideal" ? "ideal" : "final";
  const returnPath = resolveInternalReturnPath(
    resolvedSearchParams.returnPath,
    returnTo === "ideal" ? "/prototype-2/ideal" : "/prototype-2/final/summary",
  );

  return (
    <Prototype2WindowsDesktopPage returnTo={returnTo} returnPath={returnPath} />
  );
}
