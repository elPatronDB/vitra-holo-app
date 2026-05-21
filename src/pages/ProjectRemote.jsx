import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CpuChipIcon, SunIcon } from '@heroicons/react/24/solid';

const ProjectRemote = () => {
  const [syncId, setSyncId] = useState(null);
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract syncId from query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('syncId');
    setSyncId(id);
    if (!id) {
      setLoading(false);
    }
  }, []);

  // Subscribe to the Firestore Sync session in real-time
  useEffect(() => {
    if (!syncId || !db) return;

    setLoading(true);
    const docRef = doc(db, 'device_sync', syncId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSyncData(data);
      } else {
        setSyncData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore sync subscription error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncId]);

  // Request fullscreen to maximize holographic projection experience
  const requestFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) { /* Safari */
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) { /* IE11 */
      docEl.msRequestFullscreen();
    }
  };

  // If no syncId is specified in the URL
  if (!syncId) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center gap-6 selection:bg-white selection:text-black">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
          <CpuChipIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-red-400">Enlace Ausente</h2>
        <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
          Para utilizar este teléfono como proyector secundario, debes escanear el código QR generado en la sección de Ajustes desde el dispositivo controlador.
        </p>
      </div>
    );
  }

  // Loader screen if still waiting or document is not active
  const isSessionActive = syncData && syncData.status === 'active';

  if (loading || !isSessionActive) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center gap-8 overflow-hidden select-none">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Futuristic glowing radar loader */}
          <div className="absolute inset-0 rounded-full border border-vitra-cyan/10 animate-[ping_2s_infinite]" />
          <div className="absolute inset-3 rounded-full border border-vitra-cyan/20 animate-[ping_1.5s_infinite]" />
          <div className="absolute inset-6 rounded-full border border-vitra-cyan/35 animate-spin [animation-duration:3s]" />
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-vitra-cyan/40 flex items-center justify-center z-10 animate-pulse">
            <CpuChipIcon className="w-6 h-6 text-vitra-cyan" />
          </div>
        </div>

        <div className="flex flex-col gap-2 z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.25em] text-white">Esperando Conexión</h3>
          <p className="text-zinc-500 text-xs max-w-xs leading-relaxed">
            Sincronizando con el teléfono controlador. Por favor, mantén esta pestaña abierta.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 mt-4 items-center">
          <span className="text-[9px] bg-vitra-cyan/10 border border-vitra-cyan/25 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-vitra-cyan animate-pulse">
            ID: {syncId.substring(0, 12)}...
          </span>
          <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest mt-1">
            Vitra Remote Link v1.0
          </span>
        </div>
      </div>
    );
  }

  // Dynamic CSS Styles determined in real-time by the controller phone
  const lumensValue = syncData.lumens !== undefined ? syncData.lumens : 80;
  const brightnessValue = syncData.screenBrightness !== undefined ? syncData.screenBrightness : 90;

  const projectionStyle = {
    opacity: lumensValue / 100,
    filter: `brightness(${brightnessValue}%) blur(0.5px)`,
    transition: 'opacity 0.1s ease-out, filter 0.1s ease-out'
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center select-none overflow-hidden relative">
      
      {/* Floating System Bar & Fullscreen Prompt (Fades out automatically) */}
      <motion.div 
        initial={{ opacity: 1, y: -20 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 5, duration: 0.8 }}
        className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between p-3.5 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold block">Hardware Enlazado</span>
            <span className="text-xs font-bold text-white block">{syncData.title}</span>
          </div>
        </div>
        <button 
          onClick={requestFullscreen}
          className="btn btn-xs bg-vitra-cyan text-vitra-graphite border border-cyan-300 font-bold uppercase tracking-wider text-[8px] rounded-lg px-2.5 py-1.5 h-auto hover:scale-105"
        >
          Pantalla Completa
        </button>
      </motion.div>

      {/* Projection Area (4-way symmetry optimized for plastic pyramids) */}
      <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] flex items-center justify-center">
        
        {/* Top View (Rotated 180 deg) */}
        <div className="absolute top-0 rotate-180 flex flex-col items-center">
          <img 
            src={syncData.imageUrl} 
            alt="top" 
            style={projectionStyle}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.25)]" 
          />
        </div>
        
        {/* Bottom View (Facing normal) */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <img 
            src={syncData.imageUrl} 
            alt="bottom" 
            style={projectionStyle}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Left View (Rotated -90 deg) */}
        <div className="absolute left-0 -rotate-90 flex flex-col items-center">
          <img 
            src={syncData.imageUrl} 
            alt="left" 
            style={projectionStyle}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Right View (Rotated 90 deg) */}
        <div className="absolute right-0 rotate-90 flex flex-col items-center">
          <img 
            src={syncData.imageUrl} 
            alt="right" 
            style={projectionStyle}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.25)]" 
          />
        </div>

        {/* Central calibration target / Dashed Ring */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-vitra-cyan/40 flex items-center justify-center animate-[pulse_2.5s_ease-in-out_infinite] z-20 bg-black">
          <div className="w-3 h-3 bg-vitra-cyan rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]" />
        </div>
      </div>

      {/* Subtle Live Feedback Indicator */}
      <div className="absolute bottom-4 flex items-center gap-3 px-4 py-2 bg-zinc-950/40 rounded-full border border-white/5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
          <SunIcon className="w-3.5 h-3.5 text-vitra-cyan" />
          Lúmenes: {lumensValue}% | Brillo: {brightnessValue}%
        </span>
      </div>
    </div>
  );
};

export default ProjectRemote;
