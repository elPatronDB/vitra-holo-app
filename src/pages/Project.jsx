import React from 'react';
import { useHoloStore } from '../store/useHoloStore';
import { CubeIcon, PlayIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Project = () => {
  const holograms = useHoloStore(state => state.holograms);
  const activeHolo = holograms[0]; // Using the first one as default mock

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 md:py-20 md:max-w-4xl md:mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em]">Proyección Piramidal</h2>
        <p className="text-vitra-cyan/60 text-sm md:text-base mt-2">Coloca tu pirámide en el centro de la pantalla</p>
      </motion.div>

      {/* Projection Area (4-way view) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center"
      >
        {/* Top View */}
        <div className="absolute top-0 rotate-180 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="top" className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>
        
        {/* Bottom View */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="bottom" className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Left View */}
        <div className="absolute left-0 -rotate-90 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="left" className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Right View */}
        <div className="absolute right-0 rotate-90 flex flex-col items-center">
          <img src={activeHolo.imageUrl} alt="right" className="w-24 h-24 md:w-36 md:h-36 object-cover rounded-xl opacity-80 blur-[1px] shadow-[0_0_20px_rgba(0,229,255,0.3)]" />
        </div>

        {/* Center Guide */}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed border-vitra-cyan/30 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite]">
          <div className="w-2 h-2 md:w-3 md:h-3 bg-vitra-cyan rounded-full"></div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 w-full px-6 md:px-0 md:max-w-lg"
      >
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:border-vitra-cyan/30 transition-colors">
          <div className="flex items-center gap-3">
            <CubeIcon className="w-6 h-6 md:w-8 md:h-8 text-vitra-cyan" />
            <div>
              <p className="text-sm md:text-base font-bold text-white uppercase">{activeHolo.title}</p>
              <p className="text-[10px] md:text-xs text-zinc-500">Formato: Piramidal 4-vías</p>
            </div>
          </div>
          <button className="bg-vitra-cyan/10 p-3 rounded-full text-vitra-cyan hover:bg-vitra-cyan/20 transition-colors hover:scale-110 active:scale-95">
            <PlayIcon className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Project;
