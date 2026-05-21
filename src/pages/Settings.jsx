import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cog8ToothIcon, 
  SignalIcon, 
  UserCircleIcon, 
  ShieldCheckIcon,
  SunIcon,
  LightBulbIcon,
  PaintBrushIcon,
  TrashIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CpuChipIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { useHoloStore } from '../store/useHoloStore';
import { bluetoothService } from '../services/bluetoothService';
import { auth } from '../config/firebase';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';

const AVAILABLE_DEVICES = [
  { id: 'dev-1', name: 'Vitra-Lumen-Box-v1', signal: 98, desc: 'Recomendado (BLE Active)' },
  { id: 'dev-2', name: 'HoloPyramid-Pro', signal: 85, desc: 'Hardware Piramidal Standard' },
  { id: 'dev-3', name: 'LumenGlass-X2', signal: 72, desc: 'Dispositivo Óptico de Bajo Consumo' },
];

const THEMES = [
  { id: 'classic', name: 'Vitra Dark Classic', bg: '#1A1C23', accent: '#00E5FF', desc: 'Grafito oscuro elegante' },
  { id: 'amoled', name: 'Amoled Black Pro', bg: '#000000', accent: '#00E5FF', desc: 'Negro puro (Máximo contraste de proyección)' },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', bg: '#0c0f1d', accent: '#b026ff', desc: 'Mística futurista sintética' }
];

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Selected Section Tab
  const [activeTab, setActiveTab] = useState('bluetooth');

  // Bluetooth Local State (Connected to the Observer singleton)
  const [bleState, setBleState] = useState(bluetoothService.getState());
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  // User Profile States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [copiedUid, setCopiedUid] = useState(false);

  // Security States
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [securityError, setSecurityError] = useState(null);

  // Preferences Local States (persist via localStorage)
  const [pwaNotifications, setPwaNotifications] = useState(() => localStorage.getItem('pref_notif') !== 'false');
  const [autoProject, setAutoProject] = useState(() => localStorage.getItem('pref_auto_project') === 'true');
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('pref_theme') || 'classic');

  // Register as an Observer to the Bluetooth Service on mount
  useEffect(() => {
    const unsubscribe = bluetoothService.subscribe((state) => {
      setBleState(state);
    });
    return unsubscribe;
  }, []);

  // Sync state values when tabs or store states change
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  // Apply Theme Helper
  const applyTheme = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('pref_theme', themeId);
    
    // Dynamically adjust root CSS and document styles
    if (themeId === 'amoled') {
      document.body.style.backgroundColor = '#000000';
      document.documentElement.style.setProperty('--theme-bg', '#000000');
    } else if (themeId === 'cyberpunk') {
      document.body.style.backgroundColor = '#0c0f1d';
      document.documentElement.style.setProperty('--theme-bg', '#0c0f1d');
    } else {
      document.body.style.backgroundColor = '#1A1C23';
      document.documentElement.style.setProperty('--theme-bg', '#1A1C23');
    }
  };

  // Run on mount to check saved theme
  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  // Copy UID to clipboard
  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  // Bluetooth Actions
  const handleToggleBluetooth = () => {
    if (bleState.isConnected) {
      bluetoothService.disconnect();
      setSelectedDevice(null);
    } else {
      // Prompt scanning
      setIsScanning(true);
    }
  };

  const handleConnectDevice = async (device) => {
    setConnectingId(device.id);
    setSelectedDevice(device);
    try {
      await bluetoothService.connect(device.name);
      setIsScanning(false);
    } catch (err) {
      console.error(err);
    } finally {
      setConnectingId(null);
    }
  };

  // User Profile Actions
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !auth.currentUser) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim()
      });
      // Force store authentication reload to update UI components
      useAuthStore.setState({ 
        user: { ...auth.currentUser } 
      });
      setProfileSuccessMsg('¡Perfil actualizado con éxito!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Error al actualizar el nombre: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Security Actions
  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    setPasswordResetSent(false);
    setSecurityError(null);

    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetSent(true);
    } catch (err) {
      setSecurityError(err.message);
    }
  };

  // Preference Actions
  const handleToggleNotifications = (val) => {
    setPwaNotifications(val);
    localStorage.setItem('pref_notif', String(val));
  };

  const handleToggleAutoProject = (val) => {
    setAutoProject(val);
    localStorage.setItem('pref_auto_project', String(val));
  };

  const handleClearCache = () => {
    const confirm = window.confirm("¿Estás seguro de que deseas limpiar la caché local de hologramas? Se forzará la sincronización limpia desde la nube.");
    if (confirm) {
      localStorage.clear();
      // Reload app
      window.location.reload();
    }
  };

  // Logout Action
  const handleLogout = async () => {
    const confirm = window.confirm("¿Seguro que deseas cerrar la sesión de Vitra Holo?");
    if (confirm) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20 w-full md:max-w-5xl md:mx-auto">
      <header>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Ajustes</h2>
        <p className="text-vitra-cyan/60 font-medium">Configura el hardware, lúmenes y tus preferencias de usuario</p>
      </header>

      {/* Main Settings Container */}
      <div className="flex flex-col md:flex-row gap-6 items-start w-full">
        
        {/* Settings Navigation Menu */}
        <aside className="w-full md:w-64 bg-zinc-900/30 border border-white/5 rounded-3xl p-3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
          {[
            { id: 'bluetooth', label: 'Conectividad BLE', icon: SignalIcon },
            { id: 'profile', label: 'Mi Perfil', icon: UserCircleIcon },
            { id: 'security', label: 'Seguridad', icon: ShieldCheckIcon },
            { id: 'preferences', label: 'Preferencias', icon: Cog8ToothIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 shrink-0 text-sm font-bold uppercase tracking-wider ${
                  isSelected 
                    ? 'bg-vitra-cyan/15 border border-vitra-cyan/35 text-vitra-cyan shadow-[0_0_15px_rgba(0,229,255,0.08)]' 
                    : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Dynamic Viewport View */}
        <div className="flex-1 w-full bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full w-full"
            >
              {/* TAB 1: CONNECTIVITY & BLE OBSERVER */}
              {activeTab === 'bluetooth' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Conectividad Bluetooth Low Energy (BLE)
                      {bleState.isConnected && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1">
                      Conecta tus prismas activos Vitra o pirámides BLE para sincronizar lúmenes y calibrar brillo de pantalla de forma inteligente.
                    </p>
                  </div>

                  <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        bleState.isConnected ? 'bg-vitra-cyan/10 border border-vitra-cyan/20' : 'bg-zinc-800'
                      }`}>
                        <SignalIcon className={`w-5 h-5 ${bleState.isConnected ? 'text-vitra-cyan animate-pulse' : 'text-zinc-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Sensor y Emisor Lumínico</p>
                        <p className="text-[10px] text-zinc-500">
                          {bleState.isConnected ? `Vinculado a: ${bleState.deviceName}` : 'Hardware Desconectado'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggleBluetooth}
                      className={`btn btn-xs rounded-xl font-bold uppercase tracking-wider ${
                        bleState.isConnected 
                          ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' 
                          : 'bg-vitra-cyan text-vitra-graphite border border-cyan-300 hover:scale-105'
                      }`}
                    >
                      {bleState.isConnected ? 'Desconectar' : 'Conectar'}
                    </button>
                  </div>

                  {/* Dynamic Radar Scan Simulation */}
                  {isScanning && !bleState.isConnected && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border border-white/5 rounded-2xl bg-zinc-950/40 p-6 flex flex-col items-center justify-center gap-6 overflow-hidden relative"
                    >
                      {/* Radar Pulse Visuals */}
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-vitra-cyan/5 animate-[ping_2.5s_infinite]" />
                        <div className="absolute inset-3 rounded-full border-2 border-vitra-cyan/15 animate-[ping_2s_infinite]" />
                        <div className="absolute inset-6 rounded-full border-2 border-vitra-cyan/30 animate-[ping_1.5s_infinite]" />
                        <div className="w-10 h-10 rounded-full bg-vitra-cyan/10 border border-vitra-cyan/40 flex items-center justify-center z-10 animate-pulse">
                          <CpuChipIcon className="w-5 h-5 text-vitra-cyan" />
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-bold text-white animate-pulse">Escaneando señales BLE...</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Asegúrate de que tu prisma holográfico esté encendido y en modo emparejamiento.</p>
                      </div>

                      {/* BLE Devices Found */}
                      <div className="w-full flex flex-col gap-2 mt-2">
                        {AVAILABLE_DEVICES.map(device => {
                          const isConnecting = connectingId === device.id;
                          return (
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              key={device.id}
                              onClick={() => handleConnectDevice(device)}
                              disabled={connectingId !== null}
                              className="w-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 rounded-xl p-3.5 flex items-center justify-between text-left transition-colors"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{device.name}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{device.desc}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-vitra-cyan font-semibold">Signal: {device.signal}%</span>
                                <button className="btn btn-xs rounded-lg bg-vitra-cyan/10 border border-vitra-cyan/20 text-vitra-cyan font-bold uppercase tracking-wider text-[9px]">
                                  {isConnecting ? 'Vinculando...' : 'Vincular'}
                                </button>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Dynamic Hardware Controls: Sliders connected directly to the Observer Subject */}
                  {bleState.isConnected && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col gap-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2">
                        <CpuChipIcon className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Sincronización de Proyector Activa</h4>
                      </div>

                      {/* Lumen (Projection Power) Adjuster */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <LightBulbIcon className="w-4 h-4 text-vitra-cyan" />
                            Lúmenes de Proyección (Intensidad de Luz)
                          </label>
                          <span className="text-sm font-extrabold text-vitra-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                            {bleState.lumens}%
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={bleState.lumens} 
                          onChange={(e) => bluetoothService.setLumens(e.target.value)}
                          className="range range-accent range-sm cursor-pointer" 
                        />
                        <span className="text-[10px] text-zinc-500 italic">
                          Ajusta la intensidad física de los lúmenes reflejados para optimizar el contraste según la luz ambiental.
                        </span>
                      </div>

                      {/* Display Brightness Adjuster */}
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <SunIcon className="w-4 h-4 text-amber-400" />
                            Calibración de Brillo de Pantalla
                          </label>
                          <span className="text-sm font-extrabold text-amber-400 drop-shadow-[0_0_8px_rgba(251,189,35,0.4)]">
                            {bleState.screenBrightness}%
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={bleState.screenBrightness} 
                          onChange={(e) => bluetoothService.setScreenBrightness(e.target.value)}
                          className="range range-warning range-sm cursor-pointer" 
                        />
                        <span className="text-[10px] text-zinc-500 italic">
                          Ajusta el nivel de emisión de brillo de la pantalla móvil. Útil para evitar el calentamiento del panel del prisma.
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* TAB 2: USER PROFILE */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Perfil de Usuario</h3>
                    <p className="text-zinc-500 text-xs mt-1">Administra tus datos personales y visualización pública en la galería.</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 border-b border-white/5 pb-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-vitra-cyan p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.25)] bg-zinc-950">
                        <img 
                          src={user?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid || 'Felix'}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center" title="Cuenta Autenticada">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-lg font-bold text-white leading-tight">{user?.displayName || 'Usuario de Vitra'}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{user?.email}</p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                        <span className="text-[10px] bg-zinc-900 border border-white/5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-zinc-400">
                          ID: <span className="font-mono">{user?.uid?.substring(0, 8)}...</span>
                        </span>
                        <button 
                          onClick={copyUid} 
                          className="text-[10px] flex items-center gap-1 text-vitra-cyan hover:underline"
                        >
                          {copiedUid ? <CheckIcon className="w-3 h-3" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                          {copiedUid ? 'Copiado' : 'Copiar ID'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form to update displayName */}
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Modificar Nombre de Visualización
                      </label>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ingresa tu nombre..." 
                        className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-vitra-cyan/50 transition-shadow"
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSavingProfile || displayName.trim() === (user?.displayName || '')}
                      className="btn bg-vitra-cyan text-vitra-graphite border border-cyan-300 font-bold w-full uppercase tracking-wider text-xs rounded-2xl py-4 h-auto disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSavingProfile ? 'Guardando Cambios...' : 'Actualizar Nombre'}
                    </button>
                    
                    {profileSuccessMsg && (
                      <motion.p 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="text-xs font-bold text-emerald-400 text-center"
                      >
                        {profileSuccessMsg}
                      </motion.p>
                    )}
                  </form>
                </div>
              )}

              {/* TAB 3: SECURITY SECTION */}
              {activeTab === 'security' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Seguridad de la Plataforma</h3>
                    <p className="text-zinc-500 text-xs mt-1">Configura credenciales y monitorea la encriptación y protección de tus datos.</p>
                  </div>

                  {/* Security KPI stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Encriptación Local</span>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4" />
                        Activa (IndexedDB AES)
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        Los metadatos almacenados en la base de datos de tu dispositivo se cifran automáticamente en almacenamiento aislado.
                      </p>
                    </div>

                    <div className="bg-zinc-950/60 rounded-2xl border border-white/5 p-4 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reglas Firestore v2</span>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckIcon className="w-4 h-4" />
                        Cumplimiento Estricto
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        Los documentos de tus hologramas en la nube cuentan con reglas robustas vinculadas estrictamente a tu UID.
                      </p>
                    </div>
                  </div>

                  {/* Reset password card */}
                  <div className="bg-zinc-950/40 rounded-2xl border border-white/5 p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Restablecer Contraseña</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Si has ingresado con correo electrónico y contraseña, puedes solicitar un enlace automático de recuperación para cambiarla de manera segura.
                      </p>
                    </div>

                    {user?.providerData?.[0]?.providerId === 'google.com' ? (
                      <p className="text-xs text-amber-400 font-medium italic">
                        * Tu cuenta está vinculada y protegida a través de Google SSO. No requieres una contraseña de acceso secundaria.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={handlePasswordReset}
                          className="btn btn-sm rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 uppercase tracking-wider text-[10px]"
                        >
                          Enviar Correo de Recuperación
                        </button>
                        
                        {passwordResetSent && (
                          <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-xs font-bold text-emerald-400"
                          >
                            ¡Correo de recuperación enviado con éxito a {user?.email}! Revisa tu bandeja de entrada.
                          </motion.p>
                        )}
                        {securityError && (
                          <p className="text-xs font-semibold text-red-400">
                            Error: {securityError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PREFERENCES & PERSONALIZATION */}
              {activeTab === 'preferences' && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">Preferencias e Interfaz</h3>
                    <p className="text-zinc-500 text-xs mt-1">Personaliza la PWA y modifica los esquemas de visualización en tiempo real.</p>
                  </div>

                  {/* Settings toggles */}
                  <div className="flex flex-col gap-3 bg-zinc-950/20 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                    <div className="flex items-center justify-between p-4 bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <BellIcon className="w-5 h-5 text-vitra-cyan" />
                        <div>
                          <p className="text-xs font-bold text-white">Notificaciones PWA</p>
                          <p className="text-[9px] text-zinc-500">Alertas del estado de emparejamiento de prismas.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={pwaNotifications}
                        onChange={(e) => handleToggleNotifications(e.target.checked)}
                        className="toggle toggle-accent toggle-sm cursor-pointer" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <SignalIcon className="w-5 h-5 text-vitra-cyan" />
                        <div>
                          <p className="text-xs font-bold text-white">Auto-proyectar al crear</p>
                          <p className="text-[9px] text-zinc-500">Redirección directa a proyección al generar hologramas.</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={autoProject}
                        onChange={(e) => handleToggleAutoProject(e.target.checked)}
                        className="toggle toggle-accent toggle-sm cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Real-time Theme Picker */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <PaintBrushIcon className="w-4 h-4 text-vitra-cyan" />
                      Tema Visual (Esquema Cromático PWA)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => applyTheme(theme.id)}
                          className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-300 ${
                            activeTheme === theme.id 
                              ? 'bg-zinc-900 border-vitra-cyan/60 shadow-[0_0_15px_rgba(0,229,255,0.12)]' 
                              : 'bg-zinc-950/40 border-white/5 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-white">{theme.name}</span>
                            <div 
                              className="w-3.5 h-3.5 rounded-full border border-white/20"
                              style={{ backgroundColor: theme.bg }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500 leading-normal mt-0.5">{theme.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear cache block */}
                  <div className="bg-red-500/5 rounded-2xl border border-red-500/10 p-4 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TrashIcon className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-red-400">Limpieza de Datos de Almacenamiento</p>
                        <p className="text-[9px] text-zinc-500">
                          Forzar la eliminación del IndexedDB y claves locales para solucionar fallas menores de conexión.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleClearCache}
                      className="btn btn-xs rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 font-bold hover:bg-red-500/20 uppercase tracking-wider text-[9px] py-2 h-auto shrink-0"
                    >
                      Limpiar Todo
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Logout Action Area */}
      <div className="w-full flex justify-end mt-4">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl border border-red-500/15 hover:border-red-500/35 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.02)] active:scale-98"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          Cerrar Sesión de Vitra Holo
        </button>
      </div>
    </div>
  );
};

export default Settings;
