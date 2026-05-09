import { create } from 'zustand';

// Implementing the Observer pattern via Zustand for global state
export const useHoloStore = create((set, get) => ({
  holograms: [
    {
      id: 'obj-01',
      title: 'Cráneo de Cristal 3D',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      status: 'Listo',
      createdAt: 'Hace 2 horas',
    },
    {
      id: 'obj-02',
      title: 'Reloj Mecánico Virtual',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      status: 'Procesando',
      createdAt: 'Hace 5 horas',
    },
    {
      id: 'obj-03',
      title: 'Dron Miniatura Neo',
      imageUrl: 'https://images.unsplash.com/photo-1524143986875-3b098d78b363?auto=format&fit=crop&q=80&w=800',
      status: 'Listo',
      createdAt: 'Ayer',
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
