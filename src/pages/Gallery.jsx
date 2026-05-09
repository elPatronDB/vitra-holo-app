import { useHoloStore } from '../store/useHoloStore';
import { PhotoIcon } from '@heroicons/react/24/solid';

const Gallery = () => {
  const holograms = useHoloStore(state => state.holograms);

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Galería</h2>
        <p className="text-vitra-cyan/60 font-medium">Explora tu colección de hologramas 3D</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {holograms.map(holo => (
          <div key={holo.id} className="relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 group">
            <img 
              src={holo.imageUrl} 
              alt={holo.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
              <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{holo.title}</span>
              <span className="text-[8px] text-vitra-cyan font-medium">{holo.status}</span>
            </div>
          </div>
        ))}
        {/* Placeholder cards to fill grid */}
        {[3, 4, 5, 6].map(i => (
          <div key={i} className="aspect-square rounded-3xl border border-dashed border-zinc-800 flex items-center justify-center bg-zinc-900/20">
            <PhotoIcon className="w-8 h-8 text-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
