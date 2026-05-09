
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, SparklesIcon, Square3Stack3DIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, SparklesIcon as SparklesSolid, Square3Stack3DIcon as StackSolid, Cog6ToothIcon as CogSolid } from '@heroicons/react/24/solid';

const AppShell = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', OutlineIcon: HomeIcon, SolidIcon: HomeSolid },
    { path: '/generate', label: 'Crear IA', OutlineIcon: SparklesIcon, SolidIcon: SparklesSolid },
    { path: '/gallery', label: 'Galería', OutlineIcon: Square3Stack3DIcon, SolidIcon: StackSolid },
    { path: '/settings', label: 'Ajustes', OutlineIcon: Cog6ToothIcon, SolidIcon: CogSolid },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center selection:bg-white selection:text-black">
      {/* Mobile view container simulating app shell on desktop */}
      <div className="w-full max-w-md bg-base-100 min-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header / Navbar */}
        <header className="glass-effect sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Minimalist Geometric Diamond SVG Logo */}
            <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="#00B4D8" />
              <path d="M50 5 L95 50 L50 70 L25 50 Z" fill="#00E5FF" opacity="0.8" />
              <path d="M50 5 L25 50 L50 70 Z" fill="#1A1C23" opacity="0.6" />
              <circle cx="50" cy="50" r="15" fill="#00E5FF" />
            </svg>
            <h1 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-white to-vitra-cyan bg-clip-text text-transparent drop-shadow-md">
              Vitra Holo
            </h1>
          </div>
          <div className="avatar">
            <div className="w-10 rounded-full ring ring-vitra-cyan/30 ring-offset-2 ring-offset-vitra-graphite shadow-[0_0_10px_rgba(0,229,255,0.2)]">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile Avatar" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 scroll-smooth">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="glass-effect absolute bottom-0 w-full pb-safe pt-2 px-6 border-t border-white/5">
          <ul className="flex justify-between items-center mb-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = isActive ? item.SolidIcon : item.OutlineIcon;
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? 'text-vitra-cyan' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${isActive ? 'bg-vitra-cyan/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]' : 'bg-transparent'}`}>
                      <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AppShell;
