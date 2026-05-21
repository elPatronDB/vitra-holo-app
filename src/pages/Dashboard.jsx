import { useHoloStore } from '../store/useHoloStore';
import { SparklesIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
  const holograms = useHoloStore((state) => state.holograms);
  const { user } = useAuthStore();
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Sección Hero */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-2"
      >
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Hola, {userName} 👋
        </h2>
        <p className="text-vitra-cyan/60 font-medium mb-6">
          ¿Listo para dar forma a la realidad hoy?
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full md:w-auto md:min-w-[300px] bg-vitra-cyan text-vitra-graphite rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,229,255,0.4)] border border-cyan-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <SparklesIcon className="w-5 h-5 text-vitra-graphite" />
          Nuevo Vitra Holograma
        </motion.button>
      </motion.section>

      {/* Recent Holograms */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Hologramas Recientes
            <div className="w-2 h-2 rounded-full bg-vitra-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
          </h3>
          <button className="text-sm font-semibold text-vitra-cyan/70 hover:text-vitra-cyan transition-colors">
            Ver Todos
          </button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {holograms.map((holo) => (
            <motion.div
              variants={itemVariants}
              key={holo.id}
              className="group relative bg-vitra-graphite/50 backdrop-blur-sm rounded-3xl p-3 shadow-sm hover:shadow-[0_0_25px_rgba(0,229,255,0.15)] transition-all duration-300 border border-white/5 hover:border-vitra-cyan/30 flex flex-col"
            >
              <div className="relative w-full h-48 md:h-56 lg:h-48 rounded-2xl overflow-hidden mb-3 bg-zinc-800 border border-transparent group-hover:border-vitra-cyan/20 transition-colors duration-300">
                <img
                  src={holo.imageUrl}
                  alt={holo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-vitra-graphite/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <PlayCircleIcon className="w-14 h-14 text-vitra-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.6)] cursor-pointer" />
                  </motion.div>
                </div>
                <div className="absolute top-3 left-3 bg-vitra-graphite/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${holo.status === 'Listo' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  <span className="text-xs font-bold text-zinc-200">{holo.status}</span>
                </div>
              </div>
              <div className="px-2 pb-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-lg leading-tight mb-1">{holo.title}</h4>
                  <p className="text-xs font-medium text-vitra-cyan/50">{holo.createdAt}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default Dashboard;
