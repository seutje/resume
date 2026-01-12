import React from 'react';
import { useStore } from '../store';
import { PROJECTS } from '../constants';

const HUD: React.FC = () => {
  const { 
    hoveredCoordinates, 
    setActiveProject, 
    activeProjectId, 
    openResume
  } = useStore();

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 p-4 sm:p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-row flex-wrap gap-3 justify-between items-start">
        <div className="flex-1 min-w-[180px]">
          <h1 className="text-lg sm:text-xl font-bold font-mono tracking-tighter text-white">THE LATENT ATLAS</h1>
          <p className="text-[10px] sm:text-xs text-gray-500 font-mono mt-1">GPGPU NAVIGATION SYSTEM v1.0</p>
        </div>
        
        <div className="flex flex-wrap justify-end gap-2 sm:gap-4 pointer-events-auto">
          <button
            onClick={openResume}
            className="text-[10px] sm:text-xs font-mono border border-gray-700 text-gray-400 px-2 sm:px-3 py-1 bg-black hover:bg-white hover:text-black transition"
          >
            VIEW CV
          </button>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        {/* Coordinates */}
        <div className="hidden sm:block font-mono text-[10px] sm:text-xs text-gray-500">
          <div className="flex gap-4">
            <span>LAT: {hoveredCoordinates.x.toFixed(4)}</span>
            <span>LON: {hoveredCoordinates.y.toFixed(4)}</span>
          </div>
          <div className="mt-1 text-gray-700">STATUS: ORBITAL DRIFT</div>
        </div>

        {/* Quick Jump Dock */}
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md border border-gray-800 rounded-full px-4 sm:px-6 py-2 sm:py-3 flex gap-4 sm:gap-6 max-w-full overflow-x-auto">
           {PROJECTS.map((p) => {
             const isActive = activeProjectId === p.id;
             return (
             <button
               key={p.id}
               onClick={() => setActiveProject(p.id)}
               className={`group flex flex-col items-center gap-1 ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
             >
                <div 
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${isActive ? 'scale-150 ring-2 ring-white' : 'group-hover:scale-150'}`}
                    style={{ backgroundColor: p.color, boxShadow: `0 0 ${isActive ? '16px' : '10px'} ${p.color}` }}
                />
                <span className={`text-[9px] sm:text-[10px] uppercase font-mono transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                    {p.title}
                </span>
             </button>
           )})}
        </div>
        
        {/* Placeholder for balance */}
        <div className="hidden sm:block w-[150px] text-right font-mono text-xs text-gray-700">
            SYS.READY
        </div>
      </div>
    </div>
  );
};

export default HUD;
