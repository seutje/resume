# Design Document: The Latent Atlas

**Project Type:** Interactive Single-Page Application (SPA) / Portfolio
**Core Mechanic:** Spatial Navigation via WebGL Particle System
**Target Audience:** ML Engineers, Creative Technologists, Recruiters

## 1. High Concept

The portfolio is not a document; it is a **living 2D/3D latent space**. The user navigates an infinite canvas where "knowledge particles" flow between three major gravitational centers (Attractors), each representing one of your core projects (`LatentNoise`, `WoW Legends`, `Neuromorphs`).

Instead of clicking links, the user "flies" the camera. As they approach a project cluster, the environment—visuals, audio, and particle behavior—changes to reflect the nature of that project.

## 2. User Experience (UX) Architecture

### The "HUD" (Heads-Up Display)

To ensure usability isn't sacrificed for style, a static UI layer sits on top of the WebGL canvas:

* **Top Right:** "Download CV" (PDF) & "Contact".
* **Bottom Left:** Coordinates display (aesthetic touch, e.g., `Latent Space: [0.44, -0.21]`).
* **Bottom Center:** "Quick Jump" Dock. A traditional navigation bar that, when clicked, auto-pilots the camera to the specific project zone.

### The Navigation Model

* **Input:**
* *Desktop:* Mouse drag to pan, Scroll to zoom.
* *Mobile:* Pinch to zoom, swipe to pan.


* **Camera Behavior:** Smooth damping (lerping) relative to the user's cursor or input. The camera never "cuts"; it flows.

## 3. Visual Architecture & The "Zones"

The canvas is populated by ~10,000 instanced particles. Their behavior is dictated by a **Compute Shader** based on the camera's proximity to specific "Attractors."

### Zone A: The Sonic Void (LatentNoise)

* **Location:** Top Center.
* **Visuals:** Particles become turbulent and colored neon pink/cyan. They leave fading trails (referencing the visualizer in your project).
* **Interaction:**
* Approaching this zone fades in a low-pass filtered generative drone.
* **Clicking the Center:** Opens an overlay modal running a lightweight version of the `LatentNoise` visualizer.



### Zone B: The Neural Grid (Neuromorphs)

* **Location:** Bottom Left.
* **Visuals:** Particles snap into a rigid, organized grid or a Voronoi diagram. They pulse rhythmically, mimicking spiking neural networks.
* **Interaction:**
* Mouse hovering over particles here causes a chain reaction (a spike) that travels to neighbors.
* **Clicking the Center:** The particles morph to form the text of the project description.



### Zone C: The Lore Keeper (WoW Legends)

* **Location:** Bottom Right.
* **Visuals:** Particles adopt an "earthy" palette (gold, brown, fel green). They move sluggishly, clumping together to form voxel-like terrain shapes.
* **Interaction:**
* Occasional floating text appears near the cursor (e.g., generated loot stats or lore snippets).
* **Clicking the Center:** Displays the "Training Data" stats and model architecture card.



## 4. Technical Specifications

### Tech Stack

* **Core:** React (for UI overlays and routing state).
* **3D Engine:** `react-three-fiber` (Three.js wrapper).
* **Shaders:** Custom GLSL for the particle simulation (GPGPU - General Purpose computation on Graphics Processing Units). This is crucial for performance.
* **State Management:** `Zustand` (to sync the camera position with the UI state).
* **Physics/Math:** `maath` (for smooth interpolation and damping).

### The Particle System Logic (GPGPU)

You will not use CPU calculations for the particles. You will use a **Ping-Pong Buffer** technique.

1. **Texture A:** Holds current positions .
2. **Texture B:** Holds current velocities .
3. **Fragment Shader:** Calculates the next frame based on:
* Distance to Cursor (Repulsion).
* Distance to active "Project Attractor" (Gravity).
* Curl Noise (for natural "flow").



### Data Structure for Projects

```json
const projects = [
  {
    id: "latent-noise",
    position: [0, 10, 0], // The "North" attractor
    color: "#ff0055",
    behavior: "turbulent",
    audioStem: "/assets/drone_base.mp3",
    description: "In-browser generative audio model..."
  },
  {
    id: "neuromorphs",
    position: [-10, -5, 0], // The "South West" attractor
    color: "#00ff88",
    behavior: "structured",
    description: "Spiking Neural Network simulation..."
  }
  // ...
]

```

## 5. Interaction Flow (The "Happy Path")

1. **Load:** Screen is black. Loading bar fills up (labeled "Training Model...").
2. **Intro:** Particles explode from the center (Big Bang) and settle into a gentle floating state. Text fades in: *"Hi, I'm [Name]. I engineer intelligence."*
3. **Discovery:** The user notices that moving the mouse drags the world. They see a glowing pink cluster in the distance (`LatentNoise`).
4. **Approach:** As they drag towards it, the "Intro" text fades out. The background music shifts. The particles start vibrating.
5. **Engagement:** The user clicks the cluster. The camera zooms in tight. An HTML Overlay appears on the right side containing the tech stack (TensorFlow.js, WebAudio API) and a "Launch Project" button.
6. **Exit:** The user clicks "Back" or scrolls away. The overlay dismisses, and they are back in the open void, looking for the next cluster.

## 6. Accessibility & Fallbacks

Since this is a WebGL-heavy portfolio, you need a "Low Power Mode."

* **Detect GPU:** If the user is on a low-end mobile device, disable the GPGPU simulation.
* **Fallback Mode:** Replace the 3D canvas with a beautifully styled static CSS grid. The "Spatial Navigation" becomes a standard scrolling page, but keeps the aesthetic (dark mode, neon accents).

---

### Implementation Roadmap (MVP)

1. **Step 1:** Set up `react-three-fiber` and get a box moving with mouse drag.
2. **Step 2:** Replace the box with 1,000 static particles.
3. **Step 3:** Implement the GPGPU shader to make particles flow like fluid.
4. **Step 4:** Add the "Attractor" logic (particles attracted to coordinates , , etc.).
5. **Step 5:** Layer the HTML UI on top.