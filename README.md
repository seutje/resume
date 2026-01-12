# The Latent Atlas

An interactive, WebGL-driven portfolio that presents projects as drifting attractor nodes inside a simulated latent space. The experience blends a GPGPU particle system with a HUD layer, cinematic overlays, and spatial navigation so visitors "orbit" projects instead of clicking a list.

## Features

- GPGPU particle simulation with ping-pong framebuffers and custom GLSL shaders
- Project attractors that influence particle motion, color, and camera focus
- HUD overlay with quick-jump project dock and coordinate readout
- Fullscreen welcome briefing and an in-app resume viewer
- Optional low-power fallback rendering for constrained devices

## Controls

- Orbit: click + drag
- Zoom: scroll or pinch
- Select project: click a node or use the Quick Jump dock

## Tech Stack

- React 19 + TypeScript + Vite
- three.js via @react-three/fiber and @react-three/drei
- Zustand for UI/navigation state
- maath easing for smooth camera damping
- Tailwind utility classes via CDN (index.html)

## Project Structure

- `App.tsx`: App shell and layout composition.
- `components/Experience.tsx`: Three.js scene orchestration, camera rig, bloom, and fallback.
- `components/ParticleSystem.tsx`: GPU simulation and rendering of particles/connections.
- `components/HUD.tsx`: Overlay UI, quick navigation, resume button.
- `components/ProjectOverlay.tsx`: Detailed project modal.
- `components/ResumeDialog.tsx`: Resume iframe viewer.
- `components/WelcomeScreen.tsx`: Intro briefing and fullscreen entry.
- `constants.ts`: Project data, particle counts, simulation constants.
- `store.ts`: Zustand state for camera and UI.
- `shaders/`: GLSL shader definitions for simulation and rendering.

## Development

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`

Build and preview:

- `npm run build`
- `npm run preview`

## How It Works

The particle system runs entirely on the GPU. Positions are stored in a floating-point texture and updated each frame by a fragment shader (`shaders/simulationMaterial.ts`). The renderer reads those positions in `components/ParticleSystem.tsx` to draw point sprites and optional connection lines. Project "attractors" are defined in `constants.ts`, and their drifted positions are fed into the shader every frame to subtly animate the layout.

The camera is managed in `components/Experience.tsx` using OrbitControls. When a project is active, the camera smoothly eases toward the project’s drifted position, and the HUD/overlay reflect the active node. UI state lives in `store.ts` and is shared across the HUD, overlay, and resume dialog.

## Customizing Projects

Project data lives in `constants.ts` under `PROJECTS`. Each entry defines:

- `id`, `title`, `description`, `techStack`, `link`
- `position`: the 3D coordinate of the attractor
- `color`: used for particle tinting and UI accents

Adjusting `PARTICLE_COUNT`, `TEXTURE_SIZE`, or shader parameters will impact GPU load. The default configuration targets high-end machines and WebGL2-capable browsers with float texture support.
