import React, { useState, useEffect } from 'react';
import { useHoloStore } from '../store/useHoloStore';
import { CubeIcon, PlayIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { bluetoothService } from '../services/bluetoothService';

const Project = () => {
  const holograms = useHoloStore(state => state.holograms);
  const activeHolo = holograms[0]; // Using the first one as default mock

  // Observer Pattern Implementation inside the React component:
  // Component subscribes as an Observer to the Bluetooth Service singleton Subject.
  const [bleState, setBleState] = useState(bluetoothService.getState());

  useEffect(() => {
    const unsubscribe = bluetoothService.subscribe((state) => {
      setBleState(state);
    });
    return unsubscribe;
  }, []);

  if (!activeHolo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 md:py-20 text-center">
         <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em] opacity-50">Proyección Piramidal</h2>
         <p className="text-zinc-500 max-w-sm">No tienes hologramas en tu galería para proyectar. Crea uno nuevo usando Inteligencia Artificial o subiendo un archivo.</p>
      </div>
    );
  }

  // Dynamic CSS Styles determined by the Bluetooth Observer state
  const projectionStyle = {
    opacity: bleState.lumens / 100,
    filter: `brightness(${bleState.screenBrightness}%) blur(0.5px)`,
    transition: 'opacity 0.15s ease-out, filter 0.15s ease-out'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 md:py-16 md:max-w-4xl md:mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em] drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">Proyección Piramidal</h2>
        <p className="text-vitra-cyan/60 text-sm md:text-base mt-2 font-medium">Coloca tu pirámide en el centro de la pantalla</p>
      </motion.div>

      {/* Projection Area (4-way view) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-80 h-80 md:w-[480px] md:h-[480px] flex items-center justify-center bg-black/60 rounded-[40px] border border-white/5 shadow-2xl p-4"
      >
        {/* Top View (Rotated 180 deg) */}
        <div className="absolute top-4 rotate-180 flex flex-col items-center">
          <img 
            src={activeHolo.imageUrl} 
            alt="top" 
            style={projectionStyle}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)]" 
          />
        </div>
        
        {/* Bottom View (Facing normal) */}
        <div className="absolute bottom-4 flex flex-col items-center">
          <img 
            src={activeHolo.imageUrl} 
            alt="bottom" 
            style={projectionStyle}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Left View (Rotated -90 deg) */}
        <div className="absolute left-4 -rotate-90 flex flex-col items-center">
          <img 
            src={activeHolo.imageUrl} 
            alt="left" 
            style={projectionStyle}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Right View (Rotated 90 deg) */}
        <div className="absolute right-4 rotate-90 flex flex-col items-center">
          <img 
            src={activeHolo.imageUrl} 
            alt="right" 
            style={projectionStyle}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Center Guide & Anillo de Calibración */}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed border-vitra-cyan/40 flex items-center justify-center animate-[pulse_2s_ease-in-out_infinite] z-10 bg-zinc-950/80">
          <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-vitra-cyan rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>
        </div>
      </motion.div>

      {/* Controller & Device Metadata Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col gap-4 w-full px-6 md:px-0 md:max-w-lg"
      >
        {/* Hologram Details */}
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:border-vitra-cyan/30 transition-colors">
          <div className="flex items-center gap-3">
            <CubeIcon className="w-6 h-6 md:w-8 md:h-8 text-vitra-cyan" />
            <div>
              <p className="text-sm md:text-base font-bold text-white uppercase">{activeHolo.title}</p>
              <p className="text-[10px] md:text-xs text-zinc-500">Formato: Piramidal 4-vías (HoloPyramid)</p>
            </div>
          </div>
          <button className="bg-vitra-cyan/10 p-3 rounded-full text-vitra-cyan hover:bg-vitra-cyan/20 transition-colors hover:scale-110 active:scale-95">
            <PlayIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Bluetooth Hardware Feedback from Observer */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
          bleState.isConnected 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
            : 'bg-zinc-900/30 border-white/5 text-zinc-500'
        }`}>
          <div className="flex items-center gap-2.5">
            <CpuChipIcon className={`w-5 h-5 ${bleState.isConnected ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
            <div>
              <p className="font-bold uppercase tracking-wider">
                {bleState.isConnected ? `Hardware Sincronizado: ${bleState.deviceName}` : 'Hardware Desconectado'}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {bleState.isConnected 
                  ? 'Recibiendo telemetría y lúmenes dinámicos por Bluetooth Low Energy' 
                  : 'Conecta un prisma activo BLE en Ajustes para sincronización física'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-semibold text-white">Lúmenes: {bleState.lumens}%</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Brillo: {bleState.screenBrightness}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Project;

