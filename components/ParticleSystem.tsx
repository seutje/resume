import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationMaterial } from '../shaders/simulationMaterial';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleMaterial';
import { connectionVertexShader, connectionFragmentShader } from '../shaders/connectionMaterial';
import { PARTICLE_COUNT, TEXTURE_SIZE, PROJECTS, CONNECTION_RADIUS, getProjectDriftedPosition } from '../constants';
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
  const linesRef = useRef<THREE.LineSegments>(null);
  const trailRef = useRef<THREE.Points>(null);
  const mouseTrailRef = useRef(new THREE.Vector3());
  const trailHeadRef = useRef(new THREE.Vector3());
  const trailCarryRef = useRef(0);
  const activeProjectId = useStore(state => state.activeProjectId);
  const trailLength = 64;
  const trailStep = 0.05;

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
    const t4 = PROJECTS.find(p => p.id === 'noise-to-signal')?.position || [0,0,0];
    const t2 = PROJECTS.find(p => p.id === 'neuromorphs')?.position || [0,0,0];
    const t3 = PROJECTS.find(p => p.id === 'wow-legends')?.position || [0,0,0];
    mat.uniforms.uTarget1.value.set(...t1);
    mat.uniforms.uTarget2.value.set(...t2);
    mat.uniforms.uTarget3.value.set(...t3);
    mat.uniforms.uTarget4.value.set(...t4);
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
    const t4 = PROJECTS.find(p => p.id === 'noise-to-signal');
    const t2 = PROJECTS.find(p => p.id === 'neuromorphs');
    const t3 = PROJECTS.find(p => p.id === 'wow-legends');

    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uPositions: { value: initialTexture }, 
        uPointSize: { value: 0.05 },
        uTarget1: { value: new THREE.Vector3(...(t1?.position || [0,0,0])) },
        uColor1: { value: new THREE.Color(t1?.color) },
        uTarget2: { value: new THREE.Vector3(...(t2?.position || [0,0,0])) },
        uColor2: { value: new THREE.Color(t2?.color) },
        uTarget3: { value: new THREE.Vector3(...(t3?.position || [0,0,0])) },
        uColor3: { value: new THREE.Color(t3?.color) },
        uTarget4: { value: new THREE.Vector3(...(t4?.position || [0,0,0])) },
        uColor4: { value: new THREE.Color(t4?.color) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, [initialTexture]);

  const connectionMaterial = useMemo(() => {
    const t1 = PROJECTS.find(p => p.id === 'latent-noise');
    const t4 = PROJECTS.find(p => p.id === 'noise-to-signal');
    const t2 = PROJECTS.find(p => p.id === 'neuromorphs');
    const t3 = PROJECTS.find(p => p.id === 'wow-legends');

    return new THREE.ShaderMaterial({
      vertexShader: connectionVertexShader,
      fragmentShader: connectionFragmentShader,
      uniforms: {
        uPositions: { value: initialTexture },
        uColor: { value: new THREE.Color('#7c8794') },
        uOpacity: { value: 0.2 },
        uTarget1: { value: new THREE.Vector3(...(t1?.position || [0,0,0])) },
        uTarget2: { value: new THREE.Vector3(...(t2?.position || [0,0,0])) },
        uTarget3: { value: new THREE.Vector3(...(t3?.position || [0,0,0])) },
        uTarget4: { value: new THREE.Vector3(...(t4?.position || [0,0,0])) },
        uConnectionRadius: { value: CONNECTION_RADIUS },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
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

  const connectionsGeometry = useMemo(() => {
    const total = PARTICLE_COUNT * PARTICLE_COUNT;
    const connectionRatio = 0.001;
    const connectionSpread = 10;
    const connectionCount = Math.floor(total * connectionRatio);
    const vertices = new Float32Array(connectionCount * 2 * 3);
    const other = new Float32Array(connectionCount * 2 * 2);

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const toUv = (index: number) => {
      const x = index % PARTICLE_COUNT;
      const y = Math.floor(index / PARTICLE_COUNT);
      return [(x + 0.5) / PARTICLE_COUNT, (y + 0.5) / PARTICLE_COUNT];
    };

    for (let i = 0; i < connectionCount; i++) {
      const baseIndex = Math.floor(Math.random() * total);
      const baseX = baseIndex % PARTICLE_COUNT;
      const baseY = Math.floor(baseIndex / PARTICLE_COUNT);
      const offsetX = Math.floor((Math.random() - 0.5) * connectionSpread);
      const offsetY = Math.floor((Math.random() - 0.5) * connectionSpread);
      const neighborX = clamp(baseX + offsetX, 0, PARTICLE_COUNT - 1);
      const neighborY = clamp(baseY + offsetY, 0, PARTICLE_COUNT - 1);
      const neighborIndex = neighborY * PARTICLE_COUNT + neighborX;

      const [u1, v1] = toUv(baseIndex);
      const [u2, v2] = toUv(neighborIndex);
      const i6 = i * 6;
      const i4 = i * 4;
      vertices[i6] = u1;
      vertices[i6 + 1] = v1;
      vertices[i6 + 2] = 0;
      vertices[i6 + 3] = u2;
      vertices[i6 + 4] = v2;
      vertices[i6 + 5] = 0;
      other[i4] = u2;
      other[i4 + 1] = v2;
      other[i4 + 2] = u1;
      other[i4 + 3] = v1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setAttribute('aOther', new THREE.BufferAttribute(other, 2));
    return geo;
  }, []);

  const trailData = useMemo(() => {
    const positions = new Float32Array(trailLength * 3);
    const colors = new Float32Array(trailLength * 3);
    const color = new THREE.Color();
    for (let i = 0; i < trailLength; i++) {
      const t = i / Math.max(1, trailLength - 1);
      const fade = Math.pow(1 - t, 1.6);
      color.setHSL(t, 1, 0.6);
      const i3 = i * 3;
      colors[i3] = color.r * fade;
      colors[i3 + 1] = color.g * fade;
      colors[i3 + 2] = color.b * fade;
    }
    const geometry = new THREE.BufferGeometry();
    const positionAttr = new THREE.BufferAttribute(positions, 3);
    positionAttr.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttr);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return { geometry, positions, positionAttr };
  }, [trailLength]);

  const trailTexture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center, center, center, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }, []);

  const trailMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      map: trailTexture ?? undefined,
      alphaTest: 0.05,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }, [trailTexture]);

  useFrame((state) => {
    const { clock } = state;
    const { current, next } = fboRef.current;
    const t = clock.elapsedTime;
    const driftedById = (id: string) => {
      const index = PROJECTS.findIndex(p => p.id === id);
      if (index === -1) return [0, 0, 0] as [number, number, number];
      return getProjectDriftedPosition(PROJECTS[index].position, t, index);
    };
    const drift1 = driftedById('latent-noise');
    const drift2 = driftedById('neuromorphs');
    const drift3 = driftedById('wow-legends');
    const drift4 = driftedById('noise-to-signal');
    
    // A. Update Sim Uniforms
    simMaterial.uniforms.uTime.value = t;
    simMaterial.uniforms.uTarget1.value.set(...drift1);
    simMaterial.uniforms.uTarget2.value.set(...drift2);
    simMaterial.uniforms.uTarget3.value.set(...drift3);
    simMaterial.uniforms.uTarget4.value.set(...drift4);
    
    // Project mouse to a plane (Z=0 is the default reference plane)
    const vec = new THREE.Vector3(pointer.x, pointer.y, 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    const mousePos = mouseTrailRef.current.lerp(pos, 0.2);
    simMaterial.uniforms.uMouse.value.lerp(mousePos, 0.1);
    
    simMaterial.uniforms.uActive.value = activeProjectId ? 1 : 0;

    // B. Simulation Step (GPGPU)
    gl.setRenderTarget(next);
    gl.clear();
    gl.render(simScene, simCamera);
    gl.setRenderTarget(null);

    // C. Update Visuals
    if (pointsRef.current) {
        const material = pointsRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uPositions.value = next.texture;
        material.uniforms.uTarget1.value.set(...drift1);
        material.uniforms.uTarget2.value.set(...drift2);
        material.uniforms.uTarget3.value.set(...drift3);
    }
    if (linesRef.current) {
        const material = linesRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uPositions.value = next.texture;
        material.uniforms.uTarget1.value.set(...drift1);
        material.uniforms.uTarget2.value.set(...drift2);
        material.uniforms.uTarget3.value.set(...drift3);
    }

    if (trailRef.current) {
      const positions = trailData.positions;
      const head = trailHeadRef.current;
      if (head.lengthSq() === 0) {
        head.copy(mousePos);
      }

      const target = mousePos.clone();
      target.z += 0.2;
      const dist = head.distanceTo(target);
      let steps = Math.floor((dist + trailCarryRef.current) / trailStep);
      trailCarryRef.current = Math.max(0, dist + trailCarryRef.current - steps * trailStep);
      steps = Math.max(1, Math.min(steps, trailLength - 1));

      for (let s = 0; s < steps; s++) {
        const alpha = (s + 1) / steps;
        const sample = head.clone().lerp(target, alpha);
        for (let i = trailLength - 1; i > 0; i--) {
          const i3 = i * 3;
          const prev = (i - 1) * 3;
          positions[i3] = positions[prev];
          positions[i3 + 1] = positions[prev + 1];
          positions[i3 + 2] = positions[prev + 2];
        }
        positions[0] = sample.x;
        positions[1] = sample.y;
        positions[2] = sample.z;
      }

      head.copy(target);
      trailData.positionAttr.needsUpdate = true;
    }

    // D. Swap
    simMaterial.uniforms.positions.value = next.texture;
    fboRef.current.current = next;
    fboRef.current.next = current;
  });

  return (
    <>
      <points
        ref={pointsRef}
        geometry={particlesGeometry}
        material={renderMaterial}
        frustumCulled={false}
      />
      <lineSegments
        ref={linesRef}
        geometry={connectionsGeometry}
        material={connectionMaterial}
        frustumCulled={false}
      />
      <points
        ref={trailRef}
        geometry={trailData.geometry}
        material={trailMaterial}
        frustumCulled={false}
      />
    </>
  );
};

export default ParticleSystem;
