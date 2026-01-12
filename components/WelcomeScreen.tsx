import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 sm:p-10">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="absolute -top-36 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />

      <div className="relative w-full max-w-xl border border-gray-800 bg-black/70 p-6 sm:p-10 shadow-2xl animate-in fade-in duration-500">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-gray-500">
          <span className="h-[1px] w-10 bg-gray-700" />
          Navigation Briefing
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
          Welcome to the Latent Atlas
        </h1>
        <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed">
          Explore the project nodes, orbit the camera, and zoom in to surface the details.
        </p>

        <div className="mt-6 grid gap-3 text-xs sm:text-sm font-mono text-gray-400">
          <div className="flex items-center justify-between border border-gray-800 px-4 py-3">
            <span className="text-gray-500">Orbit</span>
            <span className="text-white">Drag to rotate</span>
          </div>
          <div className="flex items-center justify-between border border-gray-800 px-4 py-3">
            <span className="text-gray-500">Zoom</span>
            <span className="text-white">Scroll or pinch</span>
          </div>
          <div className="flex items-center justify-between border border-gray-800 px-4 py-3">
            <span className="text-gray-500">Browse</span>
            <span className="text-white">Click a project node</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto bg-white text-black px-6 py-3 font-mono font-bold tracking-wide hover:bg-gray-200 transition"
          >
            START EXPLORATION
          </button>
          <div className="text-[10px] sm:text-xs font-mono text-gray-500">
            Fullscreen launches automatically. Press Esc to exit.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
