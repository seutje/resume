import React from 'react';
import { useStore } from '../store';
import { PROJECTS } from '../constants';

const HUD: React.FC = () => {
  const { 
    hoveredCoordinates, 
    setActiveProject, 
    activeProjectId, 
    isLowPower, 
    toggleLowPower 
  } = useStore();

  if (activeProjectId) return null; // Hide HUD when viewing project

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tighter text-white">THE LATENT ATLAS</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">GPGPU NAVIGATION SYSTEM v1.0</p>
        </div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button onClick={toggleLowPower} className={`text-xs font-mono border px-3 py-1 hover:bg-white hover:text-black transition ${isLowPower ? 'bg-white text-black' : 'border-gray-700 text-gray-400'}`}>
            {isLowPower ? 'LOW POWER: ON' : 'HIGH PERF'}
          </button>
          <a href="#" className="text-xs font-mono border border-gray-700 text-gray-400 px-3 py-1 hover:bg-white hover:text-black transition">
            DOWNLOAD CV
          </a>
          <a href="#" className="text-xs font-mono border border-gray-700 text-gray-400 px-3 py-1 hover:bg-white hover:text-black transition">
            CONTACT
          </a>
        </div>
      </div>

      {/* Center - only visible initially */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
        <p className="text-xs font-mono tracking-[0.3em] text-white">DRAG TO NAVIGATE</p>
      </div>

      {/* Bottom Footer */}
      <div className="flex justify-between items-end">
        {/* Coordinates */}
        <div className="font-mono text-xs text-gray-500">
          <div className="flex gap-4">
            <span>LAT: {hoveredCoordinates.x.toFixed(4)}</span>
            <span>LON: {hoveredCoordinates.y.toFixed(4)}</span>
          </div>
          <div className="mt-1 text-gray-700">STATUS: ORBITAL DRIFT</div>
        </div>

        {/* Quick Jump Dock */}
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md border border-gray-800 rounded-full px-6 py-3 flex gap-6">
           {PROJECTS.map((p) => (
             <button
               key={p.id}
               onClick={() => setActiveProject(p.id)}
               className="group flex flex-col items-center gap-1"
             >
                <div 
                    className="w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-150"
                    style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
                />
                <span className="text-[10px] uppercase font-mono text-gray-400 group-hover:text-white transition-colors">
                    {p.title}
                </span>
             </button>
           ))}
        </div>
        
        {/* Placeholder for balance */}
        <div className="w-[150px] text-right font-mono text-xs text-gray-700">
            SYS.READY
        </div>
      </div>
    </div>
  );
};

export default HUD;
