import { create } from 'zustand';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { bluetoothService } from '../services/bluetoothService';

export const useHoloStore = create((set, get) => ({
  holograms: [],
  isBluetoothConnected: false,
  bluetoothDeviceName: null,
  lumens: 80,
  screenBrightness: 90,
  unsubscribe: null,
  
  // Subscribe to real-time updates from Firestore for a specific user
  subscribeHolograms: (userId) => {
    // Unsubscribe from any previous query if active
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    if (!userId || !db) {
      set({ holograms: [], unsubscribe: null });
      return;
    }

    // Query holograms for the logged-in user.
    // We do NOT use orderBy('createdAt') here to avoid requiring composite indexes in the Firebase console,
    // which simplifies setup. Instead, we sort the results in memory.
    const q = query(
      collection(db, 'holograms'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hologramsList = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Format the date/time nicely
        let friendlyTime = 'Reciente';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          const date = data.createdAt.toDate();
          const diffMs = new Date() - date;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);

          if (diffMins < 1) friendlyTime = 'Hace un momento';
          else if (diffMins < 60) friendlyTime = `Hace ${diffMins} min`;
          else if (diffHours < 24) friendlyTime = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
          else friendlyTime = date.toLocaleDateString();
        }

        return {
          id: doc.id,
          ...data,
          createdAtFriendly: friendlyTime
        };
      });

      // Sort in-memory: newest first
      hologramsList.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || Date.now();
        const timeB = b.createdAt?.toDate?.()?.getTime() || Date.now();
        return timeB - timeA;
      });

      set({ holograms: hologramsList });
    }, (error) => {
      console.error("Error listening to holograms:", error);
    });

    set({ unsubscribe });
  },

  // Unsubscribe and reset state
  unsubscribeHolograms: () => {
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }
    set({ holograms: [], unsubscribe: null });
  },
  
  // Add a hologram to Firestore (works offline natively using IndexedDB)
  addHologram: async (hologramData, userId) => {
    if (!userId || !db) {
      console.error("User ID or Firestore instance missing");
      return;
    }
    try {
      await addDoc(collection(db, 'holograms'), {
        title: hologramData.title,
        imageUrl: hologramData.imageUrl,
        status: hologramData.status || 'Listo',
        userId: userId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding hologram:", error);
      throw error;
    }
  },
  
  setBluetoothStatus: (status) => set({ isBluetoothConnected: status }),
  
  // Payloads de Lúmenes
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

// Classic Observer Pattern Subscription
// This registers a callback that maps Bluetooth Observer state updates back to Zustand.
bluetoothService.subscribe((bleState) => {
  useHoloStore.setState({
    isBluetoothConnected: bleState.isConnected,
    bluetoothDeviceName: bleState.deviceName,
    lumens: bleState.lumens,
    screenBrightness: bleState.screenBrightness,
  });
});

