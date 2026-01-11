import { create } from 'zustand';
import * as THREE from 'three';
import { PROJECTS } from './constants';

interface AppState {
  activeProjectId: string | null;
  cameraTarget: THREE.Vector3;
  hoveredCoordinates: { x: number; y: number };
  setActiveProject: (id: string | null) => void;
  setCameraTarget: (position: THREE.Vector3) => void;
  setHoveredCoordinates: (x: number, y: number) => void;
  isLowPower: boolean;
  toggleLowPower: () => void;
}

export const useStore = create<AppState>((set) => ({
  activeProjectId: null,
  cameraTarget: new THREE.Vector3(0, 0, 18), // Pulled back further for 3D view
  hoveredCoordinates: { x: 0, y: 0 },
  isLowPower: false,
  
  setActiveProject: (id) => set((state) => {
    if (id === null) {
      return { 
        activeProjectId: null, 
        cameraTarget: new THREE.Vector3(0, 0, 18) 
      };
    }
    const project = PROJECTS.find(p => p.id === id);
    if (project) {
      // Zoom in to project
      // Position camera in front of the project (Offset Z by 8)
      return { 
        activeProjectId: id, 
        cameraTarget: new THREE.Vector3(
          project.position[0], 
          project.position[1], 
          project.position[2] + 8
        ) 
      };
    }
    return state;
  }),

  setCameraTarget: (position) => set({ cameraTarget: position.clone() }),

  setHoveredCoordinates: (x, y) => set({ hoveredCoordinates: { x, y } }),
  
  toggleLowPower: () => set((state) => ({ isLowPower: !state.isLowPower })),
}));
