import React from 'react';
import { useStore } from '../store';
import { PROJECTS } from '../constants';

const ProjectOverlay: React.FC = () => {
  const { activeProjectId, setActiveProject } = useStore();
  const project = PROJECTS.find(p => p.id === activeProjectId);

  if (!project) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-end p-0 md:p-12 pointer-events-none">
      {/* Back Button / Overlay dismissal area (left side) */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onClick={() => setActiveProject(null)}
      />

      {/* Content Card */}
      <div className="w-full md:w-[450px] max-h-[80vh] md:max-h-none md:h-auto overflow-y-auto bg-black/80 backdrop-blur-xl border border-gray-800 p-5 sm:p-6 md:p-8 flex flex-col pointer-events-auto relative shadow-2xl animate-in slide-in-from-right duration-500">
        <button 
            onClick={() => setActiveProject(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-white font-mono text-xl"
        >
            ×
        </button>

        <div className="mb-2">
            <span 
                className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-black font-bold mb-4"
                style={{ backgroundColor: project.color }}
            >
                Project Node {project.id.slice(0, 3)}
            </span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 font-mono tracking-tight">{project.title}</h2>
        
        <p className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-sm md:text-base border-l-2 border-gray-800 pl-4">
            {project.description}
        </p>

        <div className="mb-6 sm:mb-8">
            <h3 className="text-xs font-mono text-gray-500 uppercase mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
                {project.techStack.map(tech => (
                    <span key={tech} className="text-xs border border-gray-700 text-gray-300 px-2 py-1">
                        {tech}
                    </span>
                ))}
            </div>
        </div>

        <div className="mt-auto">
            <a 
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 font-mono font-bold text-black hover:opacity-90 transition-opacity"
                style={{ backgroundColor: project.color }}
            >
                INITIATE LAUNCH SEQUENCE
            </a>
            
            <div className="mt-4 flex justify-between text-[10px] font-mono text-gray-600">
                <span>COORD: {project.position.join(', ')}</span>
                <span>SECURE CONNECTION</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverlay;
