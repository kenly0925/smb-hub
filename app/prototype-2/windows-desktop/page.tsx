import { Prototype2WindowsDesktopPage } from "@/components/prototype2/windows-desktop-page";

export default async function Prototype2WindowsDesktopRoute({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const returnTo =
    resolvedSearchParams.returnTo === "ideal" ? "ideal" : "final";

  return <Prototype2WindowsDesktopPage returnTo={returnTo} />;
}
