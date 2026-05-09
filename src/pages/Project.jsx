import React from 'react';
import { useHoloStore } from '../store/useHoloStore';
import { CubeIcon, PlayIcon } from '@heroicons/react/24/solid';

const Project = () => {
  const holograms = useHoloStore(state => state.holograms);
  const activeHolo = holograms[0]; // Using the first one as default mock

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 animate-fade-in overflow-hidden">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white uppercase tracking-[0.3em]">Proyección Piramidal</h2>
        <p className="text-vitra-cyan/60 text-sm mt-2">Coloca tu pirámide en el centro de la pantalla</p>
      </div>

      {/* Projection Area (4-way view) */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Top View */}
        <div className="absolute top-0 rotate-180 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="top" className="w-24 h-24 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>
        
        {/* Bottom View */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="bottom" className="w-24 h-24 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Left View */}
        <div className="absolute left-0 -rotate-90 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="left" className="w-24 h-24 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Right View */}
        <div className="absolute right-0 rotate-90 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="right" className="w-24 h-24 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Center Guide */}
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-vitra-cyan/30 flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-vitra-cyan rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full px-6">
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CubeIcon className="w-5 h-5 text-vitra-cyan" />
            <div>
              <p className="text-xs font-bold text-white uppercase">{activeHolo.title}</p>
              <p className="text-[10px] text-zinc-500">Formato: Piramidal 4-vías</p>
            </div>
          </div>
          <button className="bg-vitra-cyan/10 p-2 rounded-full text-vitra-cyan">
            <PlayIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Project;
