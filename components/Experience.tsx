import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import ParticleSystem from './ParticleSystem';
import { useStore } from '../store';
import { DEFAULT_CAMERA_Z, PROJECTS, getProjectDriftedPosition } from '../constants';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface CameraRigProps {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  isUserInteracting: React.RefObject<boolean>;
}

const CameraRig: React.FC<CameraRigProps> = ({ controlsRef, isUserInteracting }) => {
  const { cameraTarget, activeProjectId, setHoveredCoordinates } = useStore();
  const focusTarget = useRef(new THREE.Vector3());
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));
  const cameraFollowTarget = useRef(new THREE.Vector3());

  // Retrieve active project data for 3D lookAt target
  const activeProjectIndex = useMemo(
    () => PROJECTS.findIndex(p => p.id === activeProjectId),
    [activeProjectId]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const hasActiveProject = activeProjectIndex >= 0;
    const driftedActivePosition = hasActiveProject
      ? getProjectDriftedPosition(PROJECTS[activeProjectIndex].position, t, activeProjectIndex)
      : null;

    // Smooth camera movement to target
    if (!isUserInteracting.current) {
      const target = hasActiveProject
        ? cameraFollowTarget.current.set(
            driftedActivePosition![0],
            driftedActivePosition![1],
            driftedActivePosition![2] + 8
          )
        : cameraTarget;
      easing.damp3(state.camera.position, target, 0.4, delta);
    }
    
    // Update orbit target for rotations around the right focus point.
    const controls = controlsRef.current;
    if (controls) {
      if (hasActiveProject) {
        focusTarget.current.set(
          driftedActivePosition![0],
          driftedActivePosition![1],
          driftedActivePosition![2]
        );
      } else {
        focusTarget.current.copy(defaultTarget.current);
      }
      easing.damp3(controls.target, focusTarget.current, 0.4, delta);
      controls.update();
    }

    // Update coordinates display (approximate)
    setHoveredCoordinates(state.camera.position.x, state.camera.position.y);
  });

  return null;
};

const ProjectMarkers = () => {
    const { setActiveProject } = useStore();
    const markerRefs = useRef<THREE.Mesh[]>([]);

    useFrame(({ clock }) => {
      const t = clock.elapsedTime;
      for (let i = 0; i < PROJECTS.length; i++) {
        const marker = markerRefs.current[i];
        if (!marker) continue;
        const drifted = getProjectDriftedPosition(PROJECTS[i].position, t, i);
        marker.position.set(drifted[0], drifted[1], drifted[2]);
      }
    });
    
    return (
        <group>
            {PROJECTS.map((project, index) => (
                <mesh 
                    key={project.id} 
                    position={project.position} 
                    onClick={() => setActiveProject(project.id)}
                    ref={(node) => {
                      if (node) markerRefs.current[index] = node;
                    }}
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

const SubtleBloom = () => {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass } = useMemo(() => {
    const effectComposer = new EffectComposer(gl);
    effectComposer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.25,
      0.6,
      0.85
    );
    bloom.threshold = 0.1;
    bloom.strength = 0.3;
    bloom.radius = 0.6;
    effectComposer.addPass(bloom);

    return { composer: effectComposer, bloomPass: bloom };
  }, [gl, scene, camera]);

  useEffect(() => {
    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;
    return () => {
      gl.autoClear = prevAutoClear;
    };
  }, [gl]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    if (bloomPass.setSize) {
      bloomPass.setSize(size.width, size.height);
    }
  }, [composer, bloomPass, size]);

  useEffect(() => {
    return () => {
      composer.dispose();
    };
  }, [composer]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};

const Experience: React.FC = () => {
  const isLowPower = useStore(state => state.isLowPower);
  const setCameraTarget = useStore(state => state.setCameraTarget);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isUserInteracting = useRef(false);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, DEFAULT_CAMERA_Z], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={["#050505"]} />
      
      {!isLowPower ? (
          <>
            <ParticleSystem />
            <ProjectMarkers />
            <CameraRig controlsRef={controlsRef} isUserInteracting={isUserInteracting} />
            <Background />
            <OrbitControls
              ref={controlsRef}
              enableZoom
              enableRotate
              enablePan={false}
              enableDamping
              dampingFactor={0.1}
              onStart={() => {
                isUserInteracting.current = true;
              }}
              onEnd={() => {
                isUserInteracting.current = false;
                const position = controlsRef.current?.object.position;
                setCameraTarget(position ?? new THREE.Vector3(0, 0, DEFAULT_CAMERA_Z));
              }}
            />
            <SubtleBloom />
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
             <OrbitControls enableZoom enableRotate enablePan={false} />
          </group>
      )}
      
    </Canvas>
  );
};

export default Experience;
