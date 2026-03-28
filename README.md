# SMB Hub Prototypes

This repository contains interactive SMB Hub product prototypes built in Next.js. It is set up as a side-by-side storytelling environment for comparing:

- `Before`: the original platform experience
- `Ideal`: a concept version of the redesigned experience
- `After`: the final production-oriented experience

The app opens with a simple launcher at `/` so you can jump directly into any of the three flows.

## What This Project Includes

- A launcher page for switching between prototype experiences
- `Prototype 1` pages that represent the current or legacy flow
- `Prototype 2 / Ideal` pages that show the target concept design
- `Prototype 2 / Final` pages that now open in onboarding mode with empty-state defaults
- A Windows desktop installer simulation that feeds the onboarding story by adding the first connected device

## Main Routes

- `/` - launcher for Before, Ideal, and After
- `/prototype-1/dashboard` - original experience entry point
- `/prototype-2/ideal` - ideal concept entry point
- `/prototype-2/final/summary` - final onboarding entry point
- `/prototype-2/windows-desktop?returnTo=ideal`
- `/prototype-2/windows-desktop?returnTo=final`

The final experience uses empty onboarding-style states by default, while the ideal experience remains populated with demo data.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `lucide-react` for UI icons
- `recharts`, `three`, `@react-three/fiber`, `@react-three/drei`, and `react-konva` for data viz and interactive canvases

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint
npm run build
npm run start
```

## Project Structure

```text
app/
  page.tsx                      Launcher
  prototype-1/                  Before experience routes
  prototype-2/ideal/            Ideal concept routes
  prototype-2/final/            Final onboarding routes
  prototype-2/windows-desktop/  Installer simulation

components/
  prototype1/                   Before experience UI
  prototype2/                   Ideal + final experience UI

lib/
  prototype1/                   Prototype 1 data/types
  prototype2/                   Prototype 2 data, types, presentation helpers

public/
  prototype-1/                  Before experience assets
  prototype-2/                  Final/ideal assets, shields, icons, backgrounds
```

## Notes

- Prototype state is managed client-side through demo providers.
- The final flow is intentionally modeled as a first-run onboarding experience.
- The custom settings shield is used for the final empty-state summary.
- The top navigation in the final version is mounted through a shared layout so tab transitions stay smooth between routes.

## Repository

GitHub: [kenly0925/smb-hub](https://github.com/kenly0925/smb-hub)
