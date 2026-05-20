import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Generate = () => {
  return (
    <div className="flex flex-col gap-6 pb-20 md:max-w-3xl md:mx-auto w-full">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Crear IA</h2>
        <p className="text-vitra-cyan/60 font-medium">Genera nuevos hologramas con inteligencia artificial</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-vitra-graphite/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl"
      >
        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Descripción del Holograma</label>
        <textarea 
          className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 h-32 md:h-40 transition-shadow"
          placeholder="Ej: Un astronauta bailando en Marte con luces de neón..."
        ></textarea>
        
        <div className="mt-6 md:mt-8">
          <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Estilo Visual</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Cyberpunk', 'Realista', 'Abstracto', 'Minimalista'].map((style, index) => (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                key={style} 
                className="py-3 px-4 bg-zinc-800 border border-white/5 rounded-xl text-zinc-300 font-medium hover:border-vitra-cyan/50 hover:text-vitra-cyan transition-colors"
              >
                {style}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-8 md:mt-10 bg-vitra-cyan text-vitra-graphite font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 text-lg"
        >
          <SparklesIcon className="w-6 h-6" />
          Empezar Generación
        </motion.button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 p-4 bg-vitra-cyan/5 rounded-2xl border border-vitra-cyan/10"
      >
        <PhotoIcon className="w-6 h-6 text-vitra-cyan" />
        <p className="text-xs md:text-sm text-zinc-400">Tu holograma estará listo en aproximadamente 30 segundos.</p>
      </motion.div>
    </div>
  );
};

export default Generate;
