# AGENTS.md

This repository is an interactive 3D portfolio called "The Latent Atlas." Agents should prioritize preserving the spatial WebGL experience, particle simulation performance, and HUD overlay cohesion. Use this guide to navigate the architecture and make safe, intentional updates.

## Mission-Critical Concepts

- The particle field is simulated on the GPU using ping-pong framebuffers and GLSL shaders.
- Project nodes are attractors that influence particle motion, color, and camera focus.
- UI overlays are standard React components layered on top of the canvas.
- The camera never hard-cuts; all motion is eased.

## Project Layout

- `App.tsx`: Top-level layout, splash screen, and UI stacking order.
- `components/Experience.tsx`: Three.js canvas, camera rig, orbit controls, bloom, and low-power fallback.
- `components/ParticleSystem.tsx`: GPGPU simulation, particle render, and connection rendering.
- `components/HUD.tsx`: Header + quick-jump project dock + coordinate display.
- `components/ProjectOverlay.tsx`: Per-project detail card.
- `components/ResumeDialog.tsx`: Embedded resume viewer (iframe to `public/resume.html`).
- `components/WelcomeScreen.tsx`: Intro briefing and fullscreen entry.
- `constants.ts`: Project data + simulation constants.
- `store.ts`: Zustand state for camera + UI.
- `shaders/`: GLSL shaders for simulation and rendering.

## Runtime Flow (High Level)

1. `index.tsx` mounts `App.tsx`.
2. `App.tsx` renders the 3D canvas (`Experience`) and overlay UI.
3. `ParticleSystem` initializes an FBO simulation texture, updates it every frame, and renders particles.
4. `Experience` manages the camera and connects it to the selected project.
5. UI state in `store.ts` drives the HUD and overlay.

## Data Model

Project nodes are defined in `constants.ts` as `PROJECTS`. Each entry includes:

- `id` (used for routing and state)
- `title`, `description`, `techStack`, `link`
- `position` (3D coordinates for attractor logic)
- `color` (tints particles + UI accents)

Keep IDs stable; they are referenced by shaders and active-project state.

## Shader/Simulation Notes

- Simulation shader: `shaders/simulationMaterial.ts`.
- Render shader: `shaders/particleMaterial.ts`.
- Position data lives in a float texture; WebGL2 + float support is required.
- `ParticleSystem` updates uniforms every frame; avoid heavy JS per-frame work.

## Performance Guidance

- `PARTICLE_COUNT` and `TEXTURE_SIZE` (both default to 2048) are expensive.
- Reducing them can make development smoother on lower-end devices.
- The low-power fallback (spheres + orbit controls) is in `Experience.tsx`; it is gated by `store.ts` and can be surfaced with UI later if needed.

## UX Expectations

- Motion should remain smooth and cinematic (use damping/lerping instead of hard jumps).
- Overlays must keep pointer events enabled while the canvas remains interactive.
- Keep the HUD legible over the dark background and respect the existing mono type treatment.

## Common Tasks

- **Add or edit a project:** Update `constants.ts` and ensure `id` matches any references in `ParticleSystem.tsx`.
- **Change camera behavior:** Modify `CameraRig` in `components/Experience.tsx`.
- **Adjust particles:** Edit shaders or FBO config in `components/ParticleSystem.tsx`.
- **Update resume:** Replace `public/resume.html`.

## Build/Run

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Editing Tips

- Keep edits ASCII unless the file already contains Unicode.
- Maintain component boundaries; avoid adding heavy logic to UI layers.
- If you change shader uniforms, update both the simulation and render materials.
- Treat `constants.ts` as the single source of truth for project definitions.
