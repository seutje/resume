import { Project } from './types';
import * as THREE from 'three';

export const ATTRACTION_RADIUS = 50.0; // Increased radius for 3D volume
export const PARTICLE_COUNT = 2048; // Squared -> 2048x2048 = 4194304 particles
export const TEXTURE_SIZE = 2048;
export const DEFAULT_CAMERA_DISTANCE = 18;
export const DEFAULT_CAMERA_SCROLL_STEPS = 10;
export const CONNECTION_RADIUS = 15.0;
export const PROJECT_DRIFT = {
  amplitude: [0.9, 0.7, 0.6] as const,
  speed: 0.30,
};
// OrbitControls uses 0.95^zoomSpeed per wheel tick; invert to mimic scroll-down zoom-out.
export const DEFAULT_CAMERA_Z =
  DEFAULT_CAMERA_DISTANCE * Math.pow(1 / 0.95, DEFAULT_CAMERA_SCROLL_STEPS);

export const PROJECTS: Project[] = [
  {
    id: "latent-noise",
    title: "LatentNoise",
    position: [0, 8, -5], // High and deep
    color: "#ff0055", // Neon Pink
    description: "Browser-based audio‑reactive physics visualizer built with vanilla HTML/CSS/JS that uses the Web Audio API to extract real‑time spectral features, feeds them through compact neural‑network models, and maps the outputs into a particle‑physics simulation rendered on canvas with adaptive performance controls and photosensitivity‑safe clamps, wrapped in a full UI/UX layer (playlist, HUD, keyboard controls, persistence) and supported by linting/testing and model‑generation tooling—demonstrating end‑to‑end front‑end engineering, signal processing, and interactive graphics design in a single ES‑module app.",
    techStack: ["JavaScript", "WebAudio API", "GLSL", "ffmpeg"],
    link: "https://seutje.github.io/latent-noise"
  },
  {
    id: "noise-to-signal",
    title: "Noise to Signal",
    position: [-8, 6, 1], // Twice as far from LatentNoise
    color: "#00e5ff", // Cyan
    description: "Python-based offline rendering toolkit that turns a predefined album of WAV/MP3 tracks into prerendered MP4/WebM videos by analyzing audio, driving trajectories through a compact latent VAE trained on abstract imagery, decoding frames in batches, and streaming them to FFmpeg for encoding, with GPU acceleration optional but not required.",
    techStack: ["Python 3.10+", "CUDA 12.x", "PyTorch", "diffusers", "transformers"],
    link: "https://github.com/seutje/noise-to-signal"
  },
  {
    id: "neuromorphs",
    title: "Neuromorphs",
    position: [-8, -5, 5], // Left, low, foreground
    color: "#00ff88", // Neon Green
    description: "Browser-based evolutionary simulation that uses a genetic algorithm to evolve 3D block creatures with recurrent neural-network controllers, integrating Rapier3D physics and Three.js rendering in a React/Vite TypeScript app; delivered real-time simulation controls (seeds, population, epoch, environments), interactive morphology/brain editors, and visual analytics (fitness history, connectivity, morphology) to explore locomotion performance across generations.",
    techStack: ["JavaScript", "Three.js", "Rapier", "WebWorkers"],
    link: "https://seutje.github.io/neuromorphs"
  },
  {
    id: "wow-legends",
    title: "WoW Legends",
    position: [8, 0, 0], // Right, mid, center depth
    color: "#ffcc00", // Gold
    description: "Browser-based RPG trading card game prototype inspired by WoW, implementing modular ES‑module architecture (entities, systems, UI) with a playable skirmish mode, deckbuilding, combat/keyword systems, progression hooks, and a lightweight live‑reload workflow. Developed AI opponents spanning heuristics, MCTS, and neural models with supporting training/evaluation tooling, plus data-driven card definitions and content ingestion pipelines. Integrated Jest-based tests and modern tooling while keeping gameplay orchestration centralized in a clean game loop and browser entry point.",
    techStack: ["JavaScript", "AlphaZero", "MCTS", "Imagen"],
    link: "https://seutje.github.io/wow-legends"
  }
];

export const getProjectDriftedPosition = (
  position: [number, number, number],
  time: number,
  seed: number
): [number, number, number] => {
  const phase = seed * 1.7;
  const t = time * PROJECT_DRIFT.speed;
  return [
    position[0] + Math.sin(t + phase) * PROJECT_DRIFT.amplitude[0],
    position[1] + Math.cos(t * 0.9 + phase * 1.3) * PROJECT_DRIFT.amplitude[1],
    position[2] + Math.sin(t * 1.1 + phase * 2.1) * PROJECT_DRIFT.amplitude[2],
  ];
};
