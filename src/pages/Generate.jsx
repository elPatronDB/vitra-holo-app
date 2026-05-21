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
  const { addHologram, setGenerationStatus } = useHoloStore();
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
        const storageRef = ref(storage, `holograms/${user.uid}/${timestamp}.webp`);
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

  const processGenerationBackground = async (isAI, payload) => {
    const steps = isAI ? AI_STEPS : UPLOAD_STEPS;
    
    try {
      if (isAI) {
        setGenerationStatus(true, 10, steps[0]);
        // Fast tracking
        setGenerationStatus(true, 30, steps[1]);
        const genResult = await generateBaseImage(payload.prompt, payload.selectedStyle);
        
        setGenerationStatus(true, 50, steps[2]);
        setGenerationStatus(true, 70, steps[3]);
        const holographicBlob = await createHolographicLayout(genResult.imageUrl);

        setGenerationStatus(true, 85, steps[4]);
        const finalImageUrl = await saveHologramImage(holographicBlob);

        await addHologram({
          title: payload.prompt,
          imageUrl: finalImageUrl,
          status: 'IA Simulada'
        }, user.uid);

        setGenerationStatus(true, 100, steps[5]);
      } else {
        setGenerationStatus(true, 20, steps[0]);
        setGenerationStatus(true, 40, steps[1]);
        setGenerationStatus(true, 60, steps[2]);
        
        // Optimize upload path processing
        const holographicBlob = await createHolographicLayout(payload.filePreview);

        setGenerationStatus(true, 80, steps[3]);
        const finalImageUrl = await saveHologramImage(holographicBlob);

        await addHologram({
          title: payload.customTitle,
          imageUrl: finalImageUrl,
          status: 'Propio'
        }, user.uid);

        setGenerationStatus(true, 100, steps[4]);
      }
      
      // Keep "Listo" visible for just 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));
      setGenerationStatus(false, 0, '');
      
    } catch (error) {
      console.error("Failed to process background generation:", error);
      setGenerationStatus(true, 100, `Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 4000));
      setGenerationStatus(false, 0, '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    if (!uploadedFile || !customTitle.trim()) return;
    processGenerationBackground(false, { filePreview, customTitle: customTitle.trim() });
    setUploadedFile(null);
    setFilePreview(null);
    setCustomTitle('');
    
    // Redirect instantly to gallery while background process runs
    navigate('/gallery');
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
            Optimizando en Background
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
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Tab Selector - AI Disabled Temporarily */}
            <div className="flex bg-zinc-950/80 p-1.5 rounded-2xl border border-white/5 mb-2 relative overflow-hidden">
              <button
                type="button"
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-zinc-600 bg-zinc-900/40 border border-transparent cursor-not-allowed"
                title="Deshabilitado temporalmente para evitar consumos no deseados"
              >
                <SparklesIcon className="w-4 h-4 opacity-50" />
                Modelar con IA (Próximamente)
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-vitra-cyan/10 border border-vitra-cyan/25 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.03)] font-extrabold transition-all"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Subir mi Imagen
              </button>
            </div>

            {/* Custom Local Upload Form */}
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
                          Listo para Procesar
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-vitra-cyan/30 group-hover:bg-vitra-cyan/10 transition-all mb-1">
                          <ArrowUpTrayIcon className="w-6 h-6 text-zinc-400 group-hover:text-vitra-cyan transition-colors" />
                        </div>
                        <p className="text-sm font-bold text-white">Haz clic o arrastra tu imagen aquí</p>
                        <p className="text-xs text-zinc-500 max-w-[280px] leading-relaxed">
                          Soporta PNG, JPG o WEBP. Mantendremos el fondo transparente si tu imagen lo posee.
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
                        Título de la Proyección
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
                  Iniciar Procesamiento
                </motion.button>
              </div>
          </motion.form>
        </AnimatePresence>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 p-4 bg-vitra-cyan/5 rounded-2xl border border-vitra-cyan/10"
      >
        <PhotoIcon className="w-6 h-6 text-vitra-cyan shrink-0" />
        <p className="text-xs text-zinc-400">
          La imagen será adaptada a pantalla completa manteniendo las transparencias originales. El procesamiento ocurre en segundo plano, por lo que podrás seguir navegando.
        </p>
      </motion.div>
    </div>
  );
};

export default Generate;
