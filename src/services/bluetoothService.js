import { db } from '../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * BluetoothObserverService
 * Implements the classic OBSERVER PATTERN for Bluetooth Low Energy (BLE) connectivity
 * and dynamic projection controls (lumens, screen brightness),
 * extended with real-time cross-device Firestore synchronizations.
 */
class BluetoothObserverService {
  constructor() {
    this.observers = [];
    this.isConnected = false;
    this.deviceName = null;
    this.lumens = 80; // 0 to 100% (Projection light intensity)
    this.screenBrightness = 90; // 0 to 100% (Display emission)
    this.scanning = false;
    
    // Cross-Device Sync State
    this.syncId = null;
    this.isSyncActive = false;
    this.syncDeviceName = null;
  }

  /**
   * Subscribe an observer to receive status updates.
   * @param {Function|Object} observer - Can be a function or an object with an 'update' method.
   * @returns {Function} Unsubscribe function
   */
  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
    
    // Provide immediate state update upon subscription
    this.notifySingle(observer);

    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer);
    };
  }

  /**
   * Notify a single observer of the current state.
   * @private
   */
  notifySingle(observer) {
    const state = this.getState();
    try {
      if (typeof observer === 'function') {
        observer(state);
      } else if (observer && typeof observer.update === 'function') {
        observer.update(state);
      }
    } catch (err) {
      console.error("Error notifying single Bluetooth observer:", err);
    }
  }

  /**
   * Notify all registered observers of the current Bluetooth state.
   */
  notify() {
    const state = this.getState();
    this.observers.forEach((observer) => {
      try {
        if (typeof observer === 'function') {
          observer(state);
        } else if (observer && typeof observer.update === 'function') {
          observer.update(state);
        }
      } catch (err) {
        console.error("Error notifying Bluetooth observer:", err);
      }
    });
  }

  /**
   * Retrieve the current state payload.
   * @returns {Object}
   */
  getState() {
    return {
      isConnected: this.isConnected,
      deviceName: this.deviceName,
      lumens: this.lumens,
      screenBrightness: this.screenBrightness,
      scanning: this.scanning,
      
      // Sync parameters
      syncId: this.syncId,
      isSyncActive: this.isSyncActive,
      syncDeviceName: this.syncDeviceName
    };
  }

  /**
   * Set scanning state.
   */
  setScanning(scanning) {
    this.scanning = scanning;
    this.notify();
  }

  /**
   * Enable real-time cross-device synchronization.
   * Creates or initializes the sync document in Firestore.
   */
  async enableFirestoreSync(userId, initialHolo = null) {
    if (!userId || !db) return;
    
    this.syncId = userId;
    this.isSyncActive = true;
    this.syncDeviceName = "Proyector Secundario";
    this.isConnected = true;
    this.deviceName = "Enlace Web Real-Time";

    const initialData = {
      lumens: this.lumens,
      screenBrightness: this.screenBrightness,
      status: 'active',
      title: initialHolo?.title || 'Simulación de Holograma',
      imageUrl: initialHolo?.imageUrl || 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&q=80&w=800',
      updatedAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'device_sync', userId), initialData);
      console.log(`[BluetoothObserver] Firestore Dual-Screen Sync enabled for ID: ${userId}`);
    } catch (err) {
      console.error("Failed to initialize Firestore sync:", err);
    }
    
    this.notify();
  }

  /**
   * Disable cross-device sync.
   */
  async disableFirestoreSync() {
    if (this.syncId && db) {
      try {
        await updateDoc(doc(db, 'device_sync', this.syncId), {
          status: 'inactive'
        });
      } catch (err) {
        console.error("Failed to deactivate Firestore sync:", err);
      }
    }
    
    this.syncId = null;
    this.isSyncActive = false;
    this.syncDeviceName = null;
    this.isConnected = false;
    this.deviceName = null;
    this.notify();
  }

  /**
   * Update the projecting hologram image and title on the secondary phone.
   */
  async updateProjectingHolo(title, imageUrl) {
    if (!this.syncId || !db) return;
    try {
      await updateDoc(doc(db, 'device_sync', this.syncId), {
        title: title,
        imageUrl: imageUrl,
        updatedAt: Date.now()
      });
      console.log(`[BluetoothObserver] Updated remote projection: ${title}`);
    } catch (err) {
      console.error("Failed to update remote projection:", err);
    }
  }

  /**
   * Connect to a simulated BLE device.
   * @param {string} deviceName
   */
  async connect(deviceName) {
    this.setScanning(true);
    // Simulate connection lag
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    this.isConnected = true;
    this.deviceName = deviceName;
    this.scanning = false;
    this.notify();
    console.log(`[BluetoothObserver] Connected successfully to BLE device: ${deviceName}`);
  }

  /**
   * Disconnect the current device or active sync.
   */
  disconnect() {
    if (this.isSyncActive) {
      this.disableFirestoreSync();
      return;
    }
    console.log(`[BluetoothObserver] Disconnected from BLE device: ${this.deviceName}`);
    this.isConnected = false;
    this.deviceName = null;
    this.scanning = false;
    this.notify();
  }

  /**
   * Adjust projection lumens (intensity of the light source).
   * Writes to Firestore if sync is active.
   * @param {number} value (0-100)
   */
  async setLumens(value) {
    const clampedVal = Math.max(0, Math.min(100, Number(value)));
    this.lumens = clampedVal;
    this.notify();

    if (this.isSyncActive && this.syncId && db) {
      try {
        await updateDoc(doc(db, 'device_sync', this.syncId), {
          lumens: clampedVal
        });
      } catch (err) {
        console.error("Error writing lumens sync:", err);
      }
    }
  }

  /**
   * Adjust screen brightness.
   * Writes to Firestore if sync is active.
   * @param {number} value (0-100)
   */
  async setScreenBrightness(value) {
    const clampedVal = Math.max(0, Math.min(100, Number(value)));
    this.screenBrightness = clampedVal;
    this.notify();

    if (this.isSyncActive && this.syncId && db) {
      try {
        await updateDoc(doc(db, 'device_sync', this.syncId), {
          screenBrightness: clampedVal
        });
      } catch (err) {
        console.error("Error writing brightness sync:", err);
      }
    }
  }
}

// Export a single instance to be used as a global system-wide subject (Singleton Subject)
export const bluetoothService = new BluetoothObserverService();
