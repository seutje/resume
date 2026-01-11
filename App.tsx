import React, { Suspense } from 'react';
import Experience from './components/Experience';
import HUD from './components/HUD';
import ProjectOverlay from './components/ProjectOverlay';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-[#050505] overflow-hidden">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-white font-mono animate-pulse">
            LOADING LATENT SPACE...
        </div>
      }>
        <Experience />
      </Suspense>
      
      <HUD />
      <ProjectOverlay />
    </div>
  );
};

export default App;
