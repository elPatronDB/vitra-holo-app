import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, SparklesIcon, Square3Stack3DIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, SparklesIcon as SparklesSolid, Square3Stack3DIcon as StackSolid, Cog6ToothIcon as CogSolid } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Inicio', OutlineIcon: HomeIcon, SolidIcon: HomeSolid },
    { path: '/generate', label: 'Crear IA', OutlineIcon: SparklesIcon, SolidIcon: SparklesSolid },
    { path: '/project', label: 'Proyectar', isAction: true },
    { path: '/gallery', label: 'Galería', OutlineIcon: Square3Stack3DIcon, SolidIcon: StackSolid },
    { path: '/settings', label: 'Ajustes', OutlineIcon: Cog6ToothIcon, SolidIcon: CogSolid },
  ];

  const userPhoto = user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid || 'Felix'}`;
  const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center selection:bg-white selection:text-black w-full">
      <div className="w-full bg-base-100 h-screen relative flex flex-col md:flex-row overflow-hidden shadow-2xl md:shadow-none">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 xl:w-72 3xl:w-80 4k:w-96 glass-effect border-r border-white/5 relative z-50">
          <div className="p-6 flex items-center gap-3">
            <img src="/vitra_logo.png" alt="Vitra Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-white to-vitra-cyan bg-clip-text text-transparent drop-shadow-md">
              Vitra Holo
            </h1>
          </div>

          <nav className="flex-1 px-4 py-8 overflow-y-auto">
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                if (item.isAction) {
                  return (
                    <li key={item.path} className="mt-8 mb-4">
                      <Link to={item.path} className="flex flex-col items-center group">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-20 h-20 rounded-full bg-vitra-cyan shadow-[0_0_20px_rgba(0,229,255,0.5)] border-4 border-vitra-graphite flex items-center justify-center overflow-hidden p-4"
                        >
                          <img src="/vitra_logo.png" alt="Proyectar" className="w-full h-full object-contain brightness-0 invert" />
                        </motion.div>
                        <span className="text-sm mt-3 font-bold text-vitra-cyan uppercase tracking-tighter">{item.label}</span>
                      </Link>
                    </li>
                  );
                }
                const Icon = isActive ? item.SolidIcon : item.OutlineIcon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? 'bg-vitra-cyan/10 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}
                    >
                      <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-6 border-t border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="avatar flex-shrink-0">
                  <div className="w-10 rounded-full ring ring-vitra-cyan/30">
                    <img src={userPhoto} alt="Profile" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{userName}</p>
                  <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-red-400/10"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col relative w-full overflow-hidden">

          {/* Mobile Header */}
          <header className="md:hidden glass-effect sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/vitra_logo.png" alt="Vitra Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-bold tracking-widest uppercase bg-gradient-to-r from-white to-vitra-cyan bg-clip-text text-transparent drop-shadow-md py-1">
                Vitra Holo
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-xl hover:bg-red-400/10"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
              <div className="avatar">
                <div className="w-9 rounded-full ring ring-vitra-cyan/30 ring-offset-2 ring-offset-vitra-graphite shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <img src={userPhoto} alt="Profile" referrerPolicy="no-referrer" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-4 pt-4 px-4 md:px-10 md:pt-10 scroll-smooth relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden glass-effect sticky bottom-0 w-full pb-safe pt-2 px-4 border-t border-white/5 z-50">
            <ul className="flex justify-between items-center mb-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                if (item.isAction) {
                  return (
                    <li key={item.path} className="-mt-12">
                      <Link to={item.path} className="flex flex-col items-center group">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-16 h-16 rounded-full bg-vitra-cyan shadow-[0_0_20px_rgba(0,229,255,0.5)] border-4 border-vitra-graphite flex items-center justify-center overflow-hidden p-3"
                        >
                          <img src="/vitra_logo.png" alt="Proyectar" className="w-full h-full object-contain brightness-0 invert" />
                        </motion.div>
                        <span className="text-[10px] mt-1 font-bold text-vitra-cyan uppercase tracking-tighter">{item.label}</span>
                      </Link>
                    </li>
                  );
                }
                const Icon = isActive ? item.SolidIcon : item.OutlineIcon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex flex-col items-center p-2 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? 'text-vitra-cyan' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${isActive ? 'bg-vitra-cyan/10 shadow-[0_0_15px_rgba(0,229,255,0.15)]' : 'bg-transparent'}`}>
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                      </div>
                      <span className={`text-[9px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
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
    </div>
  );
};

export default AppShell;
