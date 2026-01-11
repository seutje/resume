export interface Project {
  id: string;
  title: string;
  position: [number, number, number];
  color: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}
