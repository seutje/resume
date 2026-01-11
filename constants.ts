import { Project } from './types';
import * as THREE from 'three';

export const ATTRACTION_RADIUS = 50.0; // Increased radius for 3D volume
export const PARTICLE_COUNT = 2048; // Squared -> 2048x2048 = 4194304 particles
export const TEXTURE_SIZE = 2048;
export const DEFAULT_CAMERA_DISTANCE = 28;
export const DEFAULT_CAMERA_SCROLL_STEPS = 10;
// OrbitControls uses 0.95^zoomSpeed per wheel tick; invert to mimic scroll-down zoom-out.
export const DEFAULT_CAMERA_Z =
  DEFAULT_CAMERA_DISTANCE * Math.pow(1 / 0.95, DEFAULT_CAMERA_SCROLL_STEPS);

export const PROJECTS: Project[] = [
  {
    id: "latent-noise",
    title: "LatentNoise",
    position: [0, 8, -5], // High and deep
    color: "#ff0055", // Neon Pink
    description: "Audio visualizer driven by a neural network that can be retrained in the browser. Particles become turbulent and chaotic here.",
    techStack: ["JavaScript", "WebAudio API", "GLSL", "ffmpeg"],
    link: "https://seutje.github.io/latent-noise"
  },
  {
    id: "neuromorphs",
    title: "Neuromorphs",
    position: [-8, -5, 5], // Left, low, foreground
    color: "#00ff88", // Neon Green
    description: "Teaching a neural network to walk through selective mutation. Particles snap to a structured grid.",
    techStack: ["JavaScript", "Three.js", "Rapier", "WebWorkers"],
    link: "https://seutje.github.io/neuromorphs"
  },
  {
    id: "wow-legends",
    title: "WoW Legends",
    position: [8, 0, 0], // Right, mid, center depth
    color: "#ffcc00", // Gold
    description: "Trading card game with AI opponent driven by a neural network trained against itself. Particles move sluggishly and clump like terrain.",
    techStack: ["JavaScript", "AlphaZero", "MCTS", "Imagen"],
    link: "https://seutje.github.io/wow-legends"
  }
];
