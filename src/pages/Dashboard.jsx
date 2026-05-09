
import { useHoloStore } from '../store/useHoloStore';
import { SparklesIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const holograms = useHoloStore((state) => state.holograms);

  return (
    <div className="flex flex-col gap-8 pb-8 animate-fade-in">
      {/* Sección Hero */}
      <section className="mt-2">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Hola, Alex
        </h2>
        <p className="text-vitra-cyan/60 font-medium mb-6">
          ¿Listo para dar forma a la realidad hoy?
        </p>
        
        <button className="relative w-full bg-vitra-cyan text-vitra-graphite rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-3 hover:bg-cyan-300 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)] border border-cyan-300 overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-15deg] group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <SparklesIcon className="w-5 h-5 text-vitra-graphite" />
          Generar Nuevo Holograma
        </button>
      </section>

      {/* Recent Holograms */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Hologramas Recientes
            <div className="w-2 h-2 rounded-full bg-vitra-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
          </h3>
          <button className="text-sm font-semibold text-vitra-cyan/70 hover:text-vitra-cyan transition-colors">
            Ver Todos
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {holograms.map((holo) => (
            <div 
              key={holo.id} 
              className="group relative bg-vitra-graphite/50 backdrop-blur-sm rounded-3xl p-3 shadow-sm hover:shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-all duration-300 border border-white/5 hover:border-vitra-cyan/30"
            >
              {/* Contenedor de Imagen */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3 bg-zinc-800 border border-transparent group-hover:border-vitra-cyan/20 transition-colors duration-300">
                <img 
                  src={holo.imageUrl} 
                  alt={holo.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                {/* Superposición del Botón Play */}
                <div className="absolute inset-0 bg-vitra-graphite/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <PlayCircleIcon className="w-14 h-14 text-vitra-cyan drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
                </div>
                
                {/* Etiqueta de Estado */}
                <div className="absolute top-3 left-3 bg-vitra-graphite/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${holo.status === 'Listo' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                  <span className="text-xs font-bold text-zinc-200">{holo.status}</span>
                </div>
              </div>
              
              {/* Detalles de la Tarjeta */}
              <div className="px-2 pb-1">
                <h4 className="font-bold text-white text-lg leading-tight mb-1">{holo.title}</h4>
                <p className="text-xs font-medium text-vitra-cyan/50">{holo.createdAt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
