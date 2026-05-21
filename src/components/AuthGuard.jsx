import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const AuthGuard = () => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/vitra_logo.png" alt="Vitra Logo" className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(0,229,255,0.5)]" />
          <p className="text-zinc-500 text-sm tracking-widest uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
