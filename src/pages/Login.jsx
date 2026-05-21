import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { SparklesIcon } from '@heroicons/react/24/solid';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login = () => {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, error, loading } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === 'login') {
      await loginWithEmail(email, password);
    } else {
      await registerWithEmail(email, password);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-white selection:text-black">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-vitra-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-vitra-cyan/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-sm"
      >
        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-10">
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src="/vitra_logo.png"
            alt="Vitra Logo"
            className="w-20 h-20 object-contain mb-4 drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          />
          <h1 className="text-3xl font-black tracking-widest uppercase bg-gradient-to-r from-white to-vitra-cyan bg-clip-text text-transparent">
            Vitra Holo
          </h1>
          <p className="text-zinc-500 text-sm mt-2 tracking-wide">Holograms as a Service</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-1">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h2>
          <p className="text-zinc-500 text-sm mb-7">
            {mode === 'login' ? 'Accede a tus hologramas' : 'Únete a la revolución holográfica'}
          </p>

          {/* Google button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-bold py-3.5 rounded-2xl mb-5 shadow-lg hover:bg-zinc-100 transition-colors"
          >
            <GoogleIcon />
            Continuar con Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-zinc-600 text-xs font-medium">o con email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 transition-shadow text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 transition-shadow text-sm"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error.includes('invalid-credential') ? 'Email o contraseña incorrectos.' :
                 error.includes('email-already-in-use') ? 'El email ya está registrado.' :
                 error.includes('weak-password') ? 'La contraseña debe tener mínimo 6 caracteres.' :
                 'Ocurrió un error. Inténtalo de nuevo.'}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-vitra-cyan text-vitra-graphite font-bold py-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            >
              <SparklesIcon className="w-4 h-4" />
              {submitting ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-zinc-500 text-xs mt-6">
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-vitra-cyan font-semibold hover:underline"
            >
              {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
