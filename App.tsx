import React, { Suspense, useCallback, useState } from 'react';
import Experience from './components/Experience';
import HUD from './components/HUD';
import ProjectOverlay from './components/ProjectOverlay';
import ResumeDialog from './components/ResumeDialog';
import WelcomeScreen from './components/WelcomeScreen';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleStart = useCallback(async () => {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        // Ignore fullscreen errors; keep the experience accessible.
      }
    }
    setShowWelcome(false);
  }, []);

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
      <ResumeDialog />
      {showWelcome && <WelcomeScreen onStart={handleStart} />}
    </div>
  );
};

export default App;
