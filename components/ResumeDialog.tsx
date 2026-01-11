import React from 'react';
import { useStore } from '../store';

const ResumeDialog: React.FC = () => {
  const { isResumeOpen, closeResume } = useStore();

  if (!isResumeOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-10">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeResume}
      />
      <div className="relative w-full max-w-5xl h-[80vh] bg-black border border-gray-800 shadow-2xl pointer-events-auto animate-in fade-in duration-200">
        <button
          onClick={closeResume}
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-mono text-xl"
          aria-label="Close resume"
        >
          ×
        </button>
        <iframe
          title="Resume"
          src="/resume/resume.html"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default ResumeDialog;
