import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import ParticleSystem from './ParticleSystem';
import { useStore } from '../store';
import { PROJECTS } from '../constants';

const CameraRig = () => {
  const { camera, pointer } = useThree();
  const { cameraTarget, activeProjectId, setHoveredCoordinates } = useStore();
  const vec = new THREE.Vector3();

  // Retrieve active project data for 3D lookAt target
  const activeProject = PROJECTS.find(p => p.id === activeProjectId);

  useFrame((state, delta) => {
    // Smooth camera movement to target
    easing.damp3(state.camera.position, cameraTarget, 0.4, delta);
    
    if (!activeProjectId) {
      // Idle Mode: Slight rotation based on mouse
      easing.damp3(
        state.camera.rotation,
        [
            pointer.y * 0.1, // Pitch
            -pointer.x * 0.1, // Yaw
            0
        ],
        0.5,
        delta
      );
      
      // Update coordinates display (approximate)
      setHoveredCoordinates(state.camera.position.x, state.camera.position.y);
    } else if (activeProject) {
        // Active Mode: Look smoothly at the project's actual 3D position
        easing.dampLookAt(
            state.camera, 
            activeProject.position, 
            0.4, 
            delta
        );
    }
  });

  return null;
};

const ProjectMarkers = () => {
    const { setActiveProject, activeProjectId } = useStore();
    
    return (
        <group>
            {PROJECTS.map((project) => (
                <mesh 
                    key={project.id} 
                    position={project.position} 
                    onClick={() => setActiveProject(project.id)}
                    visible={false} // Invisible hitboxes
                >
                    <sphereGeometry args={[3, 16, 16]} />
                    <meshBasicMaterial color="red" wireframe />
                </mesh>
            ))}
        </group>
    )
}

const Background = () => {
    return (
        <mesh position={[0,0,-30]}>
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial color="#050505" />
        </mesh>
    )
}

const Experience: React.FC = () => {
  const isLowPower = useStore(state => state.isLowPower);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 18], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={["#050505"]} />
      
      {!isLowPower ? (
          <>
            <ParticleSystem />
            <ProjectMarkers />
            <CameraRig />
            <Background />
          </>
      ) : (
          /* Low Power Fallback - Static Scene */
          <group>
             {PROJECTS.map((p, i) => (
                 <mesh key={i} position={p.position}>
                     <sphereGeometry args={[0.5, 32, 32]} />
                     <meshBasicMaterial color={p.color} />
                 </mesh>
             ))}
             <OrbitControls enableZoom={false} autoRotate speed={0.5} />
          </group>
      )}
      
      {/* Post-processing could go here (Bloom), but omitted for performance/simplicity */}
    </Canvas>
  );
};

export default Experience;
