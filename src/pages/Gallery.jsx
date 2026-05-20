import { useHoloStore } from '../store/useHoloStore';
import { PhotoIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const Gallery = () => {
  const holograms = useHoloStore(state => state.holograms);

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

  return (
    <div className="flex flex-col gap-6 pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Galería</h2>
        <p className="text-vitra-cyan/60 font-medium">Explora tu colección de hologramas 3D</p>
      </header>

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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <span className="text-sm font-bold text-white leading-tight line-clamp-1 mb-1">{holo.title}</span>
              <span className="text-[10px] text-vitra-cyan font-bold tracking-wider uppercase">{holo.status}</span>
            </div>
          </motion.div>
        ))}
        {/* Placeholder cards to fill grid */}
        {[3, 4, 5, 6].map(i => (
          <motion.div 
            variants={itemVariants}
            key={i} 
            className="aspect-square rounded-3xl border border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900/20"
          >
            <PhotoIcon className="w-8 h-8 text-zinc-800" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Gallery;
