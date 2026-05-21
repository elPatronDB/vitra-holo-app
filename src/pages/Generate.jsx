import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, PhotoIcon, CpuChipIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
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

const AI_STEPS = [
  'Interpretando prompt e intenciones...',
  'Generando imagen base con IA Simulada...',
  'Analizando profundidad y texturas...',
  'Componiendo proyección piramidal de 4 lados...',
  'Sincronizando con la nube y Firestore...',
  '¡Listo!'
];

const UPLOAD_STEPS = [
  'Leyendo archivo de imagen...',
  'Analizando dimensiones del archivo...',
  'Componiendo proyección piramidal de 4 lados...',
  'Sincronizando con la nube y Firestore...',
  '¡Listo!'
];

const Generate = () => {
  const { user } = useAuthStore();
  const { addHologram } = useHoloStore();
  const navigate = useNavigate();

  // Tab State: 'ai' or 'upload'
  const [activeTab, setActiveTab] = useState('ai');

  // AI Generation Form States
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk');

  // Local Upload States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [customTitle, setCustomTitle] = useState('');

  // Processing loader states
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiWarning, setApiWarning] = useState(null);

  const steps = activeTab === 'ai' ? AI_STEPS : UPLOAD_STEPS;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    
    // Auto-fill title with file name (without extension)
    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    setCustomTitle(nameWithoutExt);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveHologramImage = async (holographicBlob) => {
    if (storage) {
      try {
        const timestamp = Date.now();
        const storageRef = ref(storage, `holograms/${user.uid}/${timestamp}.jpg`);
        await uploadBytes(storageRef, holographicBlob);
        return await getDownloadURL(storageRef);
      } catch (storageError) {
        console.error("Firebase Storage failure, writing as base64 in Firestore instead:", storageError);
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(holographicBlob);
        });
      }
    } else {
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(holographicBlob);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (activeTab === 'ai') {
      if (!prompt.trim()) return;
      setGenerating(true);
      setCurrentStep(0); // Interpretando prompt...
      setApiWarning(null);

      try {
        // Step 0: Interpretando prompt...
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 1: Generando imagen...
        setCurrentStep(1);
        const genResult = await generateBaseImage(prompt.trim(), selectedStyle);
        
        if (genResult.isFallback) {
          setApiWarning("Usando preset optimizado de simulación local.");
        }

        // Step 2: Analizando profundidad...
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 700));

        // Step 3: Componiendo proyección...
        setCurrentStep(3);
        const holographicBlob = await createHolographicLayout(genResult.imageUrl);

        // Step 4: Sincronizando con la nube...
        setCurrentStep(4);
        const finalImageUrl = await saveHologramImage(holographicBlob);

        // Save hologram details to Firestore
        await addHologram({
          title: prompt.trim(),
          imageUrl: finalImageUrl,
          status: 'IA Simulada'
        }, user.uid);

        // Step 5: ¡Listo!
        setCurrentStep(5);
        await new Promise(resolve => setTimeout(resolve, 600));

        setPrompt('');
        navigate('/gallery');
      } catch (error) {
        console.error("Failed to generate and save hologram:", error);
        alert(`Error en generación: ${error.message}`);
      } finally {
        setGenerating(false);
      }
    } else {
      if (!uploadedFile || !customTitle.trim()) return;
      setGenerating(true);
      setCurrentStep(0); // Leyendo archivo...
      setApiWarning(null);

      try {
        // Step 0: Leyendo archivo...
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Step 1: Analizando dimensiones...
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Componiendo proyección...
        setCurrentStep(2);
        const holographicBlob = await createHolographicLayout(filePreview);

        // Step 3: Sincronizando con la nube...
        setCurrentStep(3);
        const finalImageUrl = await saveHologramImage(holographicBlob);

        // Save hologram details to Firestore
        await addHologram({
          title: customTitle.trim(),
          imageUrl: finalImageUrl,
          status: 'Propio'
        }, user.uid);

        // Step 4: ¡Listo!
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, 600));

        setUploadedFile(null);
        setFilePreview(null);
        setCustomTitle('');
        navigate('/gallery');
      } catch (error) {
        console.error("Failed to process and save uploaded hologram:", error);
        alert(`Error al procesar archivo: ${error.message}`);
      } finally {
        setGenerating(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 md:max-w-3xl md:mx-auto w-full">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Crear Holograma</h2>
          <p className="text-vitra-cyan/60 font-medium">Diseña o sube contenidos listos para proyectar</p>
        </div>
        <div className="shrink-0 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vitra-cyan/10 border border-vitra-cyan/20 text-[10px] font-bold uppercase tracking-wider text-vitra-cyan shadow-[0_0_10px_rgba(0,229,255,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-vitra-cyan animate-pulse" />
            MVP 100% Funcional
          </div>
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
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
            >
              {/* Tab Selector */}
              <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-white/5 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    activeTab === 'ai'
                      ? 'bg-vitra-cyan/10 border border-vitra-cyan/25 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.03)] font-extrabold'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <SparklesIcon className="w-4 h-4" />
                  Modelar con IA
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    activeTab === 'upload'
                      ? 'bg-vitra-cyan/10 border border-vitra-cyan/25 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.03)] font-extrabold'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  Subir mi Imagen
                </button>
              </div>

              {activeTab === 'ai' ? (
                /* Tab 1: AI Prompt Form */
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                      Descripción del Modelo a Simular
                    </label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 h-32 md:h-40 transition-shadow text-sm"
                      placeholder="Ej: Una calavera futurista cyberpunk con luces de neón o un automóvil superdeportivo..."
                      required={activeTab === 'ai'}
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
                    Simular Generación
                  </motion.button>
                </div>
              ) : (
                /* Tab 2: Custom Local Upload */
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Selecciona una Imagen desde tu Dispositivo
                    </label>
                    
                    <div 
                      onClick={() => document.getElementById('file-upload').click()}
                      className="border-2 border-dashed border-zinc-700/60 hover:border-vitra-cyan/50 bg-zinc-800/30 hover:bg-vitra-cyan/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group min-h-[220px]"
                    >
                      <input 
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required={activeTab === 'upload'}
                      />
                      
                      {uploadedFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-vitra-cyan/30 shadow-[0_0_15px_rgba(0,229,255,0.1)] bg-zinc-950">
                            <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                          </div>
                          <p className="text-sm font-bold text-white tracking-wide truncate max-w-[280px]">
                            {uploadedFile.name}
                          </p>
                          <span className="text-[10px] bg-vitra-cyan/10 text-vitra-cyan border border-vitra-cyan/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            Listo para Proyección
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-vitra-cyan/30 group-hover:bg-vitra-cyan/10 transition-all mb-1">
                            <ArrowUpTrayIcon className="w-6 h-6 text-zinc-400 group-hover:text-vitra-cyan transition-colors" />
                          </div>
                          <p className="text-sm font-bold text-white">Haz clic o arrastra tu imagen aquí</p>
                          <p className="text-xs text-zinc-500 max-w-[280px] leading-relaxed">
                            Soporta PNG, JPG o WEBP. El motor la adaptará automáticamente a un diseño holográfico de 4 lados.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {uploadedFile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2 mt-2"
                      >
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          Título del Holograma
                        </label>
                        <input 
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Ej: Logotipo Corporativo..."
                          className="w-full bg-zinc-800/80 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 text-sm"
                          required={activeTab === 'upload'}
                        />
                      </motion.div>
                    )}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!uploadedFile || !customTitle.trim()}
                    className="w-full bg-vitra-cyan text-vitra-graphite font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Procesar y Crear Holograma
                  </motion.button>
                </div>
              )}
            </motion.form>
          ) : (
            /* Loader State */
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

              <h3 className="text-xl font-bold text-white mb-2">Procesando Contenido</h3>
              <p className="text-zinc-500 text-sm max-w-sm mb-6">
                Nuestra motor gráfico local está adaptando los elementos para modelar la proyección de 4 lados.
              </p>

              <div className="w-full max-w-md bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-4 border border-white/5">
                <motion.div 
                  className="bg-vitra-cyan h-full shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <motion.span 
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-vitra-cyan tracking-wider uppercase"
              >
                {steps[currentStep]}
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
            Tu holograma se compilará en una plantilla cuadrada con fondo 100% negro y calibración central, lista para ser proyectada en pirámides de plástico.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Generate;
