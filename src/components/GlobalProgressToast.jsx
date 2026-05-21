import { useHoloStore } from '../store/useHoloStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CpuChipIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const GlobalProgressToast = () => {
  const { isGenerating, generationProgress, generationStepText } = useHoloStore();

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4"
        >
          <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 rounded-2xl w-full max-w-sm flex items-center gap-4 pointer-events-auto">
            {/* Icon */}
            <div className="relative shrink-0 w-10 h-10 flex items-center justify-center">
              {generationProgress >= 100 ? (
                <CheckCircleIcon className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              ) : (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-vitra-cyan/20 animate-spin" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-vitra-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:1s]" />
                  <CpuChipIcon className="w-5 h-5 text-vitra-cyan animate-pulse" />
                </>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  {generationProgress >= 100 ? 'Generación Completa' : 'Procesando Holograma'}
                </h4>
                <span className="text-vitra-cyan text-[10px] font-black">{generationProgress}%</span>
              </div>
              
              <div className="w-full bg-zinc-800 rounded-full h-1 mb-1.5 overflow-hidden">
                <motion.div 
                  className={`h-full ${generationProgress >= 100 ? 'bg-emerald-400' : 'bg-vitra-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]'}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <p className="text-[10px] text-zinc-400 font-medium truncate">
                {generationStepText}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalProgressToast;
