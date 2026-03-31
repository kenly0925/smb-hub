import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

const launchOptions = [
  {
    href: "/prototype-1/dashboard",
    badge: "Problem",
    badgeStyle: {
      borderColor: "rgba(239, 107, 110, 0.34)",
      backgroundColor: "rgba(239, 107, 110, 0.12)",
      color: "#ffb9bc",
    },
    title: "The original platform experience",
    description:
      "A cluttered onboarding flow that feels overly technical and leaves non-technical users unsure what to do next.",
  },
  {
    href: "/prototype-2/ideal",
    badge: "Concept",
    badgeStyle: {
      borderColor: "rgba(233, 171, 83, 0.34)",
      backgroundColor: "rgba(233, 171, 83, 0.12)",
      color: "#f2cb90",
    },
    title: "The ideal concept",
    description:
      "A more expressive concept that made the vision clearer, but ultimately felt too playful to get approved.",
  },
  {
    href: "/prototype-2/final/summary",
    badge: "Solution",
    badgeStyle: {
      borderColor: "rgba(47, 183, 118, 0.34)",
      backgroundColor: "rgba(47, 183, 118, 0.12)",
      color: "#7fdca8",
    },
    title: "The final production design",
    description:
      "A simplified production flow that moves most of the technical work behind the scenes and makes the experience easier to follow.",
  },
] as const;

function preventWidow(text: string) {
  const lastSpaceIndex = text.lastIndexOf(" ");

  if (lastSpaceIndex === -1) {
    return text;
  }

  return `${text.slice(0, lastSpaceIndex)}\u00A0${text.slice(lastSpaceIndex + 1)}`;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#09090b_0%,_#111114_100%)] text-[var(--color-foreground)]">
      <div className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-6xl flex-col items-center justify-center">
          <Image
            src="/crowdstrike-logo.svg"
            alt="CrowdStrike"
            width={120}
            height={120}
            className="h-auto w-[90px] sm:w-[120px]"
            priority
          />

          <div className="mt-14 flex w-full flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-center">
            {launchOptions.map((option, index) => (
              <Fragment key={option.href}>
                <Link
                  href={option.href}
                  className="relative flex-1 rounded-[6px] border border-[#34343d] bg-[#17171d] px-6 py-6 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-colors hover:border-[#6f87a6] lg:min-w-[320px]"
                >
                  <div
                    className="inline-flex rounded-[6px] border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={option.badgeStyle}
                  >
                    {option.badge}
                  </div>
                  <div className="mt-5 text-[29px] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                    {preventWidow(option.title)}
                  </div>
                  <p className="mt-4 max-w-[30ch] text-sm leading-6 text-white/68">
                    {option.description}
                  </p>
                </Link>

                {index < launchOptions.length - 1 ? (
                  <div className="hidden w-28 shrink-0 items-center justify-center lg:flex">
                    <div className="relative h-px w-full bg-[linear-gradient(90deg,rgba(119,161,216,0.08)_0%,rgba(119,161,216,0.55)_50%,rgba(119,161,216,0.08)_100%)]">
                      <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#53657f]" />
                      <span className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-[#8ab7ff]" />
                    </div>
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
