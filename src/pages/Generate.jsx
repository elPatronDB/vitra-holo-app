import { SparklesIcon, PhotoIcon } from '@heroicons/react/24/solid';

const Generate = () => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Crear IA</h2>
        <p className="text-vitra-cyan/60 font-medium">Genera nuevos hologramas con inteligencia artificial</p>
      </header>

      <div className="bg-vitra-graphite/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
        <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Descripción del Holograma</label>
        <textarea 
          className="w-full bg-zinc-800 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 h-32"
          placeholder="Ej: Un astronauta bailando en Marte con luces de neón..."
        ></textarea>
        
        <div className="mt-6">
          <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-widest">Estilo Visual</label>
          <div className="grid grid-cols-2 gap-3">
            {['Cyberpunk', 'Realista', 'Abstracto', 'Minimalista'].map(style => (
              <button key={style} className="py-3 px-4 bg-zinc-800 border border-white/5 rounded-xl text-zinc-300 font-medium hover:border-vitra-cyan/50 transition-colors">
                {style}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full mt-8 bg-vitra-cyan text-vitra-graphite font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Empezar Generación
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-vitra-cyan/5 rounded-2xl border border-vitra-cyan/10">
        <PhotoIcon className="w-6 h-6 text-vitra-cyan" />
        <p className="text-xs text-zinc-400">Tu holograma estará listo en aproximadamente 30 segundos.</p>
      </div>
    </div>
  );
};

export default Generate;
