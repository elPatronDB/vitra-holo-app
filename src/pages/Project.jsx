import React, { useState, useEffect } from 'react';
import { useHoloStore } from '../store/useHoloStore';
import useAuthStore from '../store/useAuthStore';
import { 
  CubeIcon, PlayIcon, CpuChipIcon, SignalIcon, 
  LightBulbIcon, SunIcon, CheckIcon, ClipboardDocumentIcon,
  ArrowsPointingOutIcon, ArrowsUpDownIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { bluetoothService } from '../services/bluetoothService';
import { useSearchParams } from 'react-router-dom';

const AVAILABLE_DEVICES = [
  { id: 'dev-1', name: 'Vitra-Lumen-Box-v1', signal: 98, desc: 'Recomendado (BLE Active)' },
  { id: 'dev-2', name: 'HoloPyramid-Pro', signal: 85, desc: 'Hardware Piramidal Standard' },
  { id: 'dev-3', name: 'LumenGlass-X2', signal: 72, desc: 'Dispositivo Óptico de Bajo Consumo' },
];

const Project = () => {
  const { user } = useAuthStore();
  const holograms = useHoloStore(state => state.holograms);
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  // Determine active hologram based on query or default to first
  const activeHolo = queryId ? holograms.find(h => h.id === queryId) : holograms[0];

  // Component State
  const [bleState, setBleState] = useState(bluetoothService.getState());
  const [projectionMode, setProjectionMode] = useState('local'); // 'local', 'remote', 'hardware'
  const [copiedLink, setCopiedLink] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectingId, setConnectingId] = useState(null);

  // Sync component state with Bluetooth Service
  useEffect(() => {
    const unsubscribe = bluetoothService.subscribe((state) => {
      setBleState(state);
      // If remote sync gets active via another way, ensure we show remote mode
      if (state.isSyncActive) setProjectionMode('remote');
    });
    return unsubscribe;
  }, []);

  // Update remote projection immediately if ID changes and sync is active
  useEffect(() => {
    if (bleState.isSyncActive && activeHolo) {
      bluetoothService.updateProjectingHolo(activeHolo.title, activeHolo.imageUrl);
    }
  }, [activeHolo, bleState.isSyncActive]);

  // Request wake lock to prevent the screen from turning off automatically during local projection
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && projectionMode === 'local') {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    if (projectionMode === 'local') {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible' && projectionMode === 'local') {
        requestWakeLock();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
    };
  }, [projectionMode]);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleSync = async () => {
    if (bleState.isSyncActive) {
      await bluetoothService.disableFirestoreSync();
    } else {
      if (activeHolo && user) {
        await bluetoothService.enableFirestoreSync(user.uid, activeHolo);
      }
    }
  };

  const handleToggleBluetooth = () => {
    if (bleState.isConnected && !bleState.isSyncActive) {
      bluetoothService.disconnect();
    } else {
      setIsScanning(true);
    }
  };

  const handleConnectDevice = async (device) => {
    setConnectingId(device.id);
    try {
      await bluetoothService.connect(device.name);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
    } finally {
      setConnectingId(null);
    }
  };

  if (!activeHolo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10 py-10 md:py-20 text-center">
         <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-[0.3em] opacity-50">Proyección Holográfica</h2>
         <p className="text-zinc-500 max-w-sm">No tienes hologramas en tu galería para proyectar. Crea uno nuevo usando Inteligencia Artificial o subiendo un archivo.</p>
      </div>
    );
  }

  // Local Projection Style
  const projectionStyle = {
    opacity: bleState.lumens / 100,
    filter: `brightness(${bleState.screenBrightness}%) blur(0.5px)`,
    transition: 'opacity 0.15s ease-out, filter 0.15s ease-out'
  };

  return (
    <div className="flex flex-col gap-6 pb-20 w-full md:max-w-7xl xl:max-w-[90rem] 3xl:max-w-[120rem] md:mx-auto">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Proyectar</h2>
        <p className="text-vitra-cyan/60 font-medium">Transmite tu holograma localmente o en dispositivos remotos</p>
      </header>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-3 bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
        <button
          onClick={() => setProjectionMode('local')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 min-w-[150px] ${
            projectionMode === 'local'
              ? 'bg-vitra-cyan/15 border border-vitra-cyan/30 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]'
              : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
          }`}
        >
          <PlayIcon className="w-4 h-4" />
          Proyector Local
        </button>
        <button
          onClick={() => setProjectionMode('remote')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 min-w-[150px] ${
            projectionMode === 'remote'
              ? 'bg-vitra-cyan/15 border border-vitra-cyan/30 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]'
              : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
          }`}
        >
          <SignalIcon className="w-4 h-4" />
          Enlace Remoto (Doble Pantalla)
        </button>
        <button
          onClick={() => setProjectionMode('hardware')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 min-w-[150px] ${
            projectionMode === 'hardware'
              ? 'bg-vitra-cyan/15 border border-vitra-cyan/30 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]'
              : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
          }`}
        >
          <CpuChipIcon className="w-4 h-4" />
          Hardware (BLE)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* MODE 1: LOCAL PROJECTION */}
        {projectionMode === 'local' && (
          <motion.div 
            key="local"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="relative w-full aspect-square max-h-[70vh] max-w-[70vh] mx-auto flex items-center justify-center bg-black rounded-[40px] border border-white/5 shadow-2xl overflow-hidden p-0">
              <div className="relative w-full h-full flex items-center justify-center" style={projectionStyle}>
                {/* Top Image (Rotated 180 and Mirrored) */}
                <img 
                  src={activeHolo.imageUrl} 
                  style={{ 
                    width: `${bleState.prismSize}%`, 
                    top: `${bleState.prismGap}%`,
                    transform: 'rotate(180deg) scaleX(-1)'
                  }} 
                  className="absolute object-contain origin-center" 
                  alt="top" 
                />
                {/* Bottom Image (Mirrored) */}
                <img 
                  src={activeHolo.imageUrl} 
                  style={{ 
                    width: `${bleState.prismSize}%`, 
                    bottom: `${bleState.prismGap}%`,
                    transform: 'scaleX(-1)'
                  }} 
                  className="absolute object-contain" 
                  alt="bottom" 
                />
                {/* Left Image (Rotated 90 and Mirrored) */}
                <img 
                  src={activeHolo.imageUrl} 
                  style={{ 
                    width: `${bleState.prismSize}%`, 
                    left: `${bleState.prismGap}%`,
                    transform: 'rotate(90deg) scaleX(-1)'
                  }} 
                  className="absolute object-contain origin-center" 
                  alt="left" 
                />
                {/* Right Image (Rotated -90 and Mirrored) */}
                <img 
                  src={activeHolo.imageUrl} 
                  style={{ 
                    width: `${bleState.prismSize}%`, 
                    right: `${bleState.prismGap}%`,
                    transform: 'rotate(-90deg) scaleX(-1)'
                  }} 
                  className="absolute object-contain origin-center" 
                  alt="right" 
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* MODE 2: REMOTE PROJECTION (DUAL SCREEN) */}
        {projectionMode === 'remote' && (
          <motion.div 
            key="remote"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-zinc-950/60 rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  bleState.isSyncActive ? 'bg-vitra-cyan/10 border border-vitra-cyan/20' : 'bg-zinc-800'
                }`}>
                  <SignalIcon className={`w-7 h-7 ${bleState.isSyncActive ? 'text-vitra-cyan animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Enlace de Proyector Inalámbrico</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {bleState.isSyncActive 
                      ? `Transmitiendo "${activeHolo.title}" a proyector remoto.` 
                      : 'Activa el enlace para transmitir el holograma actual a otra pantalla.'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggleSync}
                className={`btn rounded-2xl font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto transition-all ${
                  bleState.isSyncActive
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                    : 'bg-vitra-cyan text-vitra-graphite border border-cyan-300 hover:scale-105 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                }`}
              >
                {bleState.isSyncActive ? 'Detener Proyección Remota' : 'Iniciar Proyección Remota'}
              </button>
            </div>

            {bleState.isSyncActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col md:flex-row gap-6 p-6 border border-vitra-cyan/20 bg-vitra-cyan/5 rounded-3xl items-center"
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="p-3 bg-white rounded-2xl shadow-xl border border-vitra-cyan/40 select-none">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `${window.location.origin}/project-remote?syncId=${user?.uid}`
                      )}&color=0c0f1d&bgcolor=ffffff`}
                      alt="QR Code"
                      className="w-40 h-40 object-contain rounded-lg"
                      draggable="false"
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-extrabold">
                    Escanear con Proyector
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-5 text-center md:text-left">
                  <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-vitra-cyan">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider">Listo para Proyección</span>
                    </div>
                    <h4 className="text-xl font-extrabold text-white mt-1">Conecta tu Proyector</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mt-2">
                      Escanea este código QR con la cámara de tu tablet o teléfono proyector. Se abrirá la pantalla de visualización y reflejará los hologramas automáticamente.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                      O usa este enlace directo:
                    </span>
                    <div className="flex gap-2 w-full max-w-md mx-auto md:mx-0">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/project-remote?syncId=${user?.uid}`}
                        className="flex-1 bg-zinc-950/60 border border-white/5 rounded-xl p-3 text-xs font-mono text-zinc-400 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(`${window.location.origin}/project-remote?syncId=${user?.uid}`)}
                        className="btn rounded-xl bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800 p-3 h-auto min-h-0"
                      >
                        {copiedLink ? <CheckIcon className="w-5 h-5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* MODE 3: HARDWARE (BLE) */}
        {projectionMode === 'hardware' && (
          <motion.div 
            key="hardware"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-zinc-950/60 rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  bleState.isConnected && !bleState.isSyncActive ? 'bg-vitra-cyan/10 border border-vitra-cyan/20' : 'bg-zinc-800'
                }`}>
                  <CpuChipIcon className={`w-7 h-7 ${bleState.isConnected && !bleState.isSyncActive ? 'text-vitra-cyan animate-pulse' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <p className="text-base font-bold text-white">Hardware Prisma BLE</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {bleState.isConnected && !bleState.isSyncActive 
                      ? `Vinculado a: ${bleState.deviceName}` 
                      : 'Conecta un prisma interactivo inteligente para sincronización física.'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleToggleBluetooth}
                disabled={bleState.isSyncActive}
                className={`btn rounded-2xl font-bold uppercase tracking-wider text-xs px-8 py-4 h-auto transition-all ${
                  bleState.isSyncActive
                    ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-transparent'
                    : bleState.isConnected && !bleState.isSyncActive
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                      : 'bg-vitra-cyan text-vitra-graphite border border-cyan-300 hover:scale-105'
                }`}
              >
                {bleState.isConnected && !bleState.isSyncActive ? 'Desconectar hardware' : 'Escanear dispositivos'}
              </button>
            </div>

            {isScanning && !bleState.isConnected && !bleState.isSyncActive && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="border border-white/5 rounded-3xl bg-zinc-950/40 p-8 flex flex-col items-center justify-center gap-8 overflow-hidden relative"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-vitra-cyan/5 animate-[ping_2.5s_infinite]" />
                  <div className="absolute inset-4 rounded-full border-2 border-vitra-cyan/15 animate-[ping_2s_infinite]" />
                  <div className="absolute inset-8 rounded-full border-2 border-vitra-cyan/30 animate-[ping_1.5s_infinite]" />
                  <div className="w-12 h-12 rounded-full bg-vitra-cyan/10 border border-vitra-cyan/40 flex items-center justify-center z-10 animate-pulse">
                    <CpuChipIcon className="w-6 h-6 text-vitra-cyan" />
                  </div>
                </div>
                
                <div className="w-full flex flex-col gap-3 mt-4 max-w-md mx-auto">
                  {AVAILABLE_DEVICES.map(device => {
                    const isConnecting = connectingId === device.id;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key={device.id}
                        onClick={() => handleConnectDevice(device)}
                        disabled={connectingId !== null}
                        className="w-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 rounded-2xl p-4 flex items-center justify-between text-left transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{device.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{device.desc}</p>
                        </div>
                        <span className="btn btn-xs rounded-xl bg-vitra-cyan/10 border border-vitra-cyan/20 text-vitra-cyan font-bold uppercase tracking-wider text-[10px] px-4 py-2 h-auto">
                          {isConnecting ? 'Conectando...' : 'Conectar'}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL SLIDERS (Always visible below modes) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5"
      >
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5 text-vitra-cyan" />
              Lúmenes (Intensidad Física)
            </label>
            <span className="text-sm font-extrabold text-vitra-cyan">{bleState.lumens}%</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            value={bleState.lumens} 
            onChange={(e) => bluetoothService.setLumens(e.target.value)}
            className="range range-accent range-sm cursor-pointer" 
          />
          <p className="text-[10px] text-zinc-500">Afecta el contraste y penetración lumínica en el cristal del prisma.</p>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <SunIcon className="w-5 h-5 text-amber-400" />
              Brillo de Pantalla (Digital)
            </label>
            <span className="text-sm font-extrabold text-amber-400">{bleState.screenBrightness}%</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            value={bleState.screenBrightness} 
            onChange={(e) => bluetoothService.setScreenBrightness(e.target.value)}
            className="range range-warning range-sm cursor-pointer" 
          />
          <p className="text-[10px] text-zinc-500">Afecta el nivel de emisión de la pantalla móvil remota o local.</p>
        </div>
      </motion.div>

      {/* CALIBRATION SLIDERS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-6 bg-zinc-900/40 p-6 md:p-8 rounded-3xl border border-white/5"
      >
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ArrowsUpDownIcon className="w-5 h-5 text-fuchsia-400" />
              Apertura Central (Gap)
            </label>
            <span className="text-sm font-extrabold text-fuchsia-400">{bleState.prismGap}%</span>
          </div>
          <input 
            type="range" min="0" max="40" 
            value={bleState.prismGap} 
            onChange={(e) => bluetoothService.setPrismGap(e.target.value)}
            className="range range-secondary range-sm cursor-pointer" 
          />
          <p className="text-[10px] text-zinc-500">Aleja o acerca las imágenes al centro. Ajusta esto al tamaño de la base de tu prisma (ej. 2x2 pulgadas).</p>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ArrowsPointingOutIcon className="w-5 h-5 text-indigo-400" />
              Tamaño de Imagen (Escala)
            </label>
            <span className="text-sm font-extrabold text-indigo-400">{bleState.prismSize}%</span>
          </div>
          <input 
            type="range" min="10" max="80" 
            value={bleState.prismSize} 
            onChange={(e) => bluetoothService.setPrismSize(e.target.value)}
            className="range range-primary range-sm cursor-pointer" 
          />
          <p className="text-[10px] text-zinc-500">Aumenta o reduce el tamaño de los hologramas para que no se corten en los bordes del cristal.</p>
        </div>
      </motion.div>

    </div>
  );
};

export default Project;

