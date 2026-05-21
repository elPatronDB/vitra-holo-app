import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, PhotoIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useHoloStore } from '../store/useHoloStore';
import { generateBaseImage } from '../services/geminiService';
import { createHolographicLayout } from '../utils/canvasProcessor';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

// Map visual styles to standard previews for the selector
const STYLE_IMAGES = {
  'Cyberpunk': 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&q=80&w=800',
  'Realista': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
  'Abstracto': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
  'Minimalista': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
};

const GENERATION_STEPS = [
  'Interpretando prompt e intenciones...',
  'Generando imagen base con Gemini IA...',
  'Analizando profundidad y texturas...',
  'Componiendo proyección piramidal de 4 lados...',
  'Sincronizando con Firestore y la nube...',
  '¡Listo!'
];

const Generate = () => {
  const { user } = useAuthStore();
  const { addHologram } = useHoloStore();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk');
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiWarning, setApiWarning] = useState(null);

  const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setGenerating(true);
    setCurrentStep(0); // Interpretando prompt...
    setApiWarning(null);

    try {
      // 1. Give context reading time
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(1); // Generando imagen con Gemini...

      // 2. Call the Gemini service
      const genResult = await generateBaseImage(prompt.trim(), selectedStyle);
      
      if (genResult.isFallback && genResult.error) {
        setApiWarning(genResult.error);
      }

      setCurrentStep(2); // Analizando profundidad...
      await new Promise(resolve => setTimeout(resolve, 700));

      setCurrentStep(3); // Componiendo proyección...
      const holographicBlob = await createHolographicLayout(genResult.imageUrl);

      setCurrentStep(4); // Sincronizando con la nube...
      let finalImageUrl = genResult.imageUrl;

      if (storage) {
        try {
          const timestamp = Date.now();
          const storageRef = ref(storage, `holograms/${user.uid}/${timestamp}.png`);
          await uploadBytes(storageRef, holographicBlob);
          finalImageUrl = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.error("Firebase Storage failure, writing as base64 in Firestore instead:", storageError);
          // Fallback to storing as base64 URL inside Firestore
          finalImageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(holographicBlob);
          });
        }
      } else {
        // No storage available, save base64
        finalImageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(holographicBlob);
        });
      }

      // 3. Save hologram details to Firestore
      await addHologram({
        title: prompt.trim(),
        imageUrl: finalImageUrl,
        status: genResult.isFallback ? 'Demo' : 'Listo'
      }, user.uid);

      setCurrentStep(5); // ¡Listo!
      await new Promise(resolve => setTimeout(resolve, 600));

      // Reset form and navigate to gallery
      setPrompt('');
      navigate('/gallery');
    } catch (error) {
      console.error("Failed to generate and save hologram:", error);
      alert(`Error en generación: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 md:max-w-3xl md:mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Crear IA</h2>
          <p className="text-vitra-cyan/60 font-medium">Genera nuevos hologramas con inteligencia artificial</p>
        </div>
        <div className="shrink-0 self-start sm:self-center">
          {hasApiKey ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vitra-cyan/10 border border-vitra-cyan/20 text-[10px] font-bold uppercase tracking-wider text-vitra-cyan shadow-[0_0_10px_rgba(0,229,255,0.08)]">
              <span className="w-1.5 h-1.5 rounded-full bg-vitra-cyan animate-pulse" />
              Gemini Imagen 3 Conectado
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Modo Demostración
            </div>
          )}
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {!generating ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleGenerate}
              className="flex flex-col gap-6"
            >
              {!hasApiKey && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">💡 Clave de API no detectada</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Para habilitar generación por IA real, agrega <code className="text-white bg-zinc-800 px-1 py-0.5 rounded text-[10px]">VITE_GEMINI_API_KEY</code> a tu archivo <code className="text-white bg-zinc-800 px-1 py-0.5 rounded text-[10px]">.env.local</code>. Actualmente se usarán renders premium pre-diseñados procesados por nuestro motor Canvas.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                  Descripción del Holograma
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 h-32 md:h-40 transition-shadow text-sm"
                  placeholder="Ej: Una maqueta realista de un edificio de departamentos de cristal con luces interiores..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest">
                  Estilo Visual
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.keys(STYLE_IMAGES).map((style, index) => (
                    <motion.button 
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={style} 
                      onClick={() => setSelectedStyle(style)}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all duration-300 ${
                        selectedStyle === style 
                          ? 'bg-vitra-cyan border-vitra-cyan text-vitra-graphite shadow-[0_0_15px_rgba(0,229,255,0.25)]' 
                          : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {style}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!prompt.trim()}
                className="w-full mt-4 bg-vitra-cyan text-vitra-graphite font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                Empezar Generación
              </motion.button>
            </motion.form>
          ) : (
            <motion.div 
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-vitra-cyan/15 animate-spin" />
                <div className="absolute inset-0 rounded-full border-4 border-t-vitra-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:1s]" />
                <div className="absolute inset-4 bg-vitra-cyan/10 rounded-full flex items-center justify-center border border-vitra-cyan/20">
                  <CpuChipIcon className="w-10 h-10 text-vitra-cyan animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Procesando Generación</h3>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">
                Nuestra Inteligencia Artificial está procesando tu prompt para modelar el holograma de 4 lados.
              </p>

              <div className="w-full max-w-md bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-4 border border-white/5">
                <motion.div 
                  className="bg-vitra-cyan h-full shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / GENERATION_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <motion.span 
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-vitra-cyan tracking-wider uppercase"
              >
                {GENERATION_STEPS[currentStep]}
              </motion.span>

              {apiWarning && (
                <p className="mt-4 text-[10px] text-amber-400/80 max-w-xs font-medium italic">
                  * {apiWarning}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!generating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-4 bg-vitra-cyan/5 rounded-2xl border border-vitra-cyan/10"
        >
          <PhotoIcon className="w-6 h-6 text-vitra-cyan shrink-0" />
          <p className="text-xs text-zinc-400">
            Tu holograma se generará en una plantilla cuadrada de 4 lados con fondo 100% negro y calibración central, lista para pirámides de proyección.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Generate;
