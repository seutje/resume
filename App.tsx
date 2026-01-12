import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Experience from './components/Experience';
import HUD from './components/HUD';
import ProjectOverlay from './components/ProjectOverlay';
import ResumeDialog from './components/ResumeDialog';
import WelcomeScreen from './components/WelcomeScreen';
import { useStore } from './store';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const setAutoRotateEnabled = useStore(state => state.setAutoRotateEnabled);
  const isAudioMuted = useStore(state => state.isAudioMuted);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio('The Latent Atlas.mp3');
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
      return;
    }
    audioRef.current.loop = true;
    audioRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || showWelcome) return;

    if (isAudioMuted) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // Ignore playback errors; user gesture may be required.
      });
    }
  }, [isAudioMuted, showWelcome]);

  const handleStart = useCallback(async () => {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      try {
        await root.requestFullscreen();
      } catch {
        // Ignore fullscreen errors; keep the experience accessible.
      }
    }

    const audio = audioRef.current;
    if (audio && !isAudioMuted) {
      try {
        await audio.play();
      } catch {
        // Ignore autoplay errors; user may need another gesture.
      }
    }

    setShowWelcome(false);
    setAutoRotateEnabled(true);
  }, [isAudioMuted, setAutoRotateEnabled]);

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
