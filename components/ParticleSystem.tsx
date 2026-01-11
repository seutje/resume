import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationMaterial } from '../shaders/simulationMaterial';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleMaterial';
import { PARTICLE_COUNT, TEXTURE_SIZE, PROJECTS } from '../constants';
import { useStore } from '../store';

const generatePositions = (width: number, height: number) => {
  const length = width * height * 4;
  const data = new Float32Array(length);
  for (let i = 0; i < length; i += 4) {
    // Spread them out more initially for 3D volume
    const x = (Math.random() - 0.5) * 50; 
    const y = (Math.random() - 0.5) * 50;
    const z = (Math.random() - 0.5) * 40; // Significant Z depth
    data[i] = x;
    data[i + 1] = y;
    data[i + 2] = z;
    data[i + 3] = 1.0; 
  }
  return data;
};

const ParticleSystem: React.FC = () => {
  const { gl, camera, pointer } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const activeProjectId = useStore(state => state.activeProjectId);

  // 1. FBOs (Ping-Pong Buffers)
  const options = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    stencilBuffer: false,
    depthBuffer: false,
  };
  
  const fbo1 = useFBO(TEXTURE_SIZE, TEXTURE_SIZE, options);
  const fbo2 = useFBO(TEXTURE_SIZE, TEXTURE_SIZE, options);
  
  const fboRef = useRef({
    current: fbo1,
    next: fbo2,
  });

  // 2. Simulation Material
  const simMaterial = useMemo(() => {
    const mat = SimulationMaterial.clone();
    const t1 = PROJECTS.find(p => p.id === 'latent-noise')?.position || [0,0,0];
    const t2 = PROJECTS.find(p => p.id === 'neuromorphs')?.position || [0,0,0];
    const t3 = PROJECTS.find(p => p.id === 'wow-legends')?.position || [0,0,0];
    mat.uniforms.uTarget1.value.set(...t1);
    mat.uniforms.uTarget2.value.set(...t2);
    mat.uniforms.uTarget3.value.set(...t3);
    return mat;
  }, []);

  // 3. Simulation Scene, Camera & Initial Data
  const [simScene, simCamera, initialTexture] = useMemo(() => {
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Initial Data
    const pos = generatePositions(TEXTURE_SIZE, TEXTURE_SIZE);
    const texture = new THREE.DataTexture(pos, TEXTURE_SIZE, TEXTURE_SIZE, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    
    // Set the initial input for the simulation
    simMaterial.uniforms.positions.value = texture;

    // Full screen quad for simulation
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, simMaterial);
    scene.add(mesh);
    
    return [scene, cam, texture];
  }, [simMaterial]);

  // 4. Render Material
  const renderMaterial = useMemo(() => {
    const t1 = PROJECTS.find(p => p.id === 'latent-noise');
    const t2 = PROJECTS.find(p => p.id === 'neuromorphs');
    const t3 = PROJECTS.find(p => p.id === 'wow-legends');

    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uPositions: { value: initialTexture }, 
        uPointSize: { value: 3.5 }, 
        uTarget1: { value: new THREE.Vector3(...(t1?.position || [0,0,0])) },
        uColor1: { value: new THREE.Color(t1?.color) },
        uTarget2: { value: new THREE.Vector3(...(t2?.position || [0,0,0])) },
        uColor2: { value: new THREE.Color(t2?.color) },
        uTarget3: { value: new THREE.Vector3(...(t3?.position || [0,0,0])) },
        uColor3: { value: new THREE.Color(t3?.color) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, [initialTexture]);

  // 5. Geometry
  const particlesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT * PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const x = (i % PARTICLE_COUNT) + 0.5;
        const y = Math.floor(i / PARTICLE_COUNT) + 0.5;
        vertices[i3] = x / PARTICLE_COUNT;
        vertices[i3 + 1] = y / PARTICLE_COUNT;
        vertices[i3 + 2] = 0;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const { clock } = state;
    const { current, next } = fboRef.current;
    
    // A. Update Sim Uniforms
    simMaterial.uniforms.uTime.value = clock.elapsedTime;
    
    // Project mouse to a plane (Z=0 is the default reference plane)
    const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    simMaterial.uniforms.uMouse.value.lerp(pos, 0.1);
    
    simMaterial.uniforms.uActive.value = activeProjectId ? 1 : 0;

    // B. Simulation Step (GPGPU)
    gl.setRenderTarget(next);
    gl.clear();
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // C. Update Visuals
    if (pointsRef.current) {
        (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uPositions.value = next.texture;
    }

    // D. Swap
    simMaterial.uniforms.positions.value = next.texture;
    fboRef.current.current = next;
    fboRef.current.next = current;
  });

  return (
      <points ref={pointsRef} geometry={particlesGeometry} material={renderMaterial} />
  );
};

export default ParticleSystem;