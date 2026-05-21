import { useState } from 'react';
import { useHoloStore } from '../store/useHoloStore';
import { PhotoIcon, SparklesIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const { holograms, deleteHologram } = useHoloStore();
  const [holoToDelete, setHoloToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  const handleDelete = async () => {
    if (!holoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteHologram(holoToDelete.id);
      setHoloToDelete(null);
    } catch (error) {
      console.error("Error deleting hologram:", error);
      alert("Hubo un problema al eliminar el holograma.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Galería</h2>
        <p className="text-vitra-cyan/60 font-medium">Explora tu colección de hologramas 3D</p>
      </header>

      {holograms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center p-12 bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-md min-h-[350px] shadow-2xl"
        >
          <div className="w-20 h-20 rounded-full bg-vitra-cyan/10 flex items-center justify-center mb-6 border border-vitra-cyan/20 animate-pulse">
            <PhotoIcon className="w-10 h-10 text-vitra-cyan" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tu galería está vacía</h3>
          <p className="text-zinc-500 text-sm max-w-sm mb-8 leading-relaxed">
            Genera tu primer objeto 3D con inteligencia artificial y sincronízalo directamente con tus dispositivos.
          </p>
          <Link to="/generate">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-vitra-cyan text-vitra-graphite font-bold py-3.5 px-8 rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2"
            >
              <SparklesIcon className="w-5 h-5" />
              Crear Holograma
            </motion.button>
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {holograms.map(holo => (
            <motion.div 
              variants={itemVariants}
              key={holo.id} 
              className="relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 group shadow-lg"
            >
              <img 
                src={holo.imageUrl} 
                alt={holo.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Top Action Bar (Trash) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setHoloToDelete(holo)}
                  className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm shadow-lg transition-transform hover:scale-110 active:scale-95"
                  title="Eliminar holograma"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                <span className="text-sm font-bold text-white leading-tight line-clamp-1 mb-1">{holo.title}</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-vitra-cyan font-bold tracking-wider uppercase">{holo.status}</span>
                  <span className="text-[9px] text-zinc-500 font-semibold">{holo.createdAtFriendly || 'Reciente'}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {/* Decorative dashed card to encourage creation */}
          <Link to="/generate">
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-3xl border border-dashed border-zinc-800 hover:border-vitra-cyan/50 flex flex-col gap-2 items-center justify-center bg-zinc-900/10 hover:bg-vitra-cyan/5 transition-all duration-300 group cursor-pointer"
            >
              <SparklesIcon className="w-8 h-8 text-zinc-700 group-hover:text-vitra-cyan group-hover:scale-110 transition-all" />
              <span className="text-[11px] text-zinc-600 group-hover:text-vitra-cyan/80 font-bold uppercase tracking-wider transition-colors">Crear Nuevo</span>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {holoToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setHoloToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-zinc-900 border border-white/10 p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar holograma?</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Estás a punto de borrar <span className="text-white font-bold">"{holoToDelete.title}"</span>. Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setHoloToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
