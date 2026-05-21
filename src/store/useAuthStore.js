import { create } from 'zustand';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useHoloStore } from './useHoloStore';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  // Inicializar el listener de estado de autenticación
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
      if (user) {
        // Automatically subscribe to the user's holograms
        useHoloStore.getState().subscribeHolograms(user.uid);
      } else {
        // Automatically unsubscribe and clear gallery state on logout
        useHoloStore.getState().unsubscribeHolograms();
      }
    });
    return unsubscribe;
  },

  // Login con Google
  loginWithGoogle: async () => {
    set({ error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      set({ user: result.user });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Login con Email/Password
  loginWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      set({ user: result.user });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Registro con Email/Password
  registerWithEmail: async (email, password) => {
    set({ error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      set({ user: result.user });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
