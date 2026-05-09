import { Cog8ToothIcon, SignalIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const Settings = () => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Ajustes</h2>
        <p className="text-vitra-cyan/60 font-medium">Configura tu hardware y preferencias</p>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">Conectividad</h3>
        <div className="bg-vitra-graphite/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
          <div className="flex items-center justify-between p-4 bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-vitra-cyan/10 flex items-center justify-center">
                <SignalIcon className="w-5 h-5 text-vitra-cyan" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Bluetooth</p>
                <p className="text-[10px] text-zinc-500">Estado: Desconectado</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-accent toggle-sm" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">Cuenta</h3>
        <div className="bg-vitra-graphite/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
          {[
            { icon: UserCircleIcon, label: 'Perfil de Usuario' },
            { icon: ShieldCheckIcon, label: 'Seguridad' },
            { icon: Cog8ToothIcon, label: 'Preferencias' }
          ].map(item => (
            <button key={item.label} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-200">{item.label}</span>
              </div>
              <div className="w-2 h-2 border-t-2 border-r-2 border-zinc-600 rotate-45"></div>
            </button>
          ))}
        </div>
      </section>

      <button className="w-full py-4 text-sm font-bold text-red-400 hover:text-red-300 transition-colors">
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Settings;
