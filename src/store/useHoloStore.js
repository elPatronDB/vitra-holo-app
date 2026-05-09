import { create } from 'zustand';

// Implementing the Observer pattern via Zustand for global state
export const useHoloStore = create((set, get) => ({
  holograms: [
    {
      id: '1',
      title: 'Ciudad Cyberpunk Neón',
      imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800',
      status: 'Listo',
      createdAt: 'Hace 2 horas',
    },
    {
      id: '2',
      title: 'Formas Geométricas Abstractas',
      imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
      status: 'Procesando',
      createdAt: 'Hace 5 horas',
    },
  ],
  isBluetoothConnected: false,
  
  // Actions
  addHologram: (hologram) => set((state) => ({ 
    holograms: [hologram, ...state.holograms] 
  })),
  
  setBluetoothStatus: (status) => set({ isBluetoothConnected: status }),
  
  // Future method for "Payloads de Lúmenes"
  sendLumenPayload: (id) => {
    const state = get();
    const holo = state.holograms.find(h => h.id === id);
    if (!state.isBluetoothConnected) {
      console.warn("Bluetooth not connected. Cannot send payload.");
      return;
    }
    console.log(`Sending lumen payload for: ${holo?.title}`);
  }
}));
