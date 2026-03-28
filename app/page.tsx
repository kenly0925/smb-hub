import Image from "next/image";
import Link from "next/link";

const launchOptions = [
  {
    href: "/prototype-1/dashboard",
    label: "Before",
    copy: "Original platform experience.",
  },
  {
    href: "/prototype-2/ideal",
    label: "Ideal",
    copy: "My ideal concept design.",
  },
  {
    href: "/prototype-2/final/summary",
    label: "After",
    copy: "Final production experience.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#09090b_0%,_#111114_100%)] text-[var(--color-foreground)]">
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-4xl flex-col items-center justify-center">
          <Image
            src="/crowdstrike-logo.svg"
            alt="CrowdStrike"
            width={120}
            height={120}
            className="h-auto w-[90px] sm:w-[120px]"
            priority
          />

          <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
            {launchOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="rounded-2xl border border-[#34343d] bg-[#17171d] px-6 py-6 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:border-[#565664] hover:bg-[#1d1d24]"
              >
                <div className="text-2xl font-semibold tracking-[-0.02em] text-white">
                  {option.label}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">{option.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
