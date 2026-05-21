/**
 * BluetoothObserverService
 * Implements the classic OBSERVER PATTERN for Bluetooth Low Energy (BLE) connectivity
 * and dynamic projection controls (lumens, screen brightness).
 */
class BluetoothObserverService {
  constructor() {
    this.observers = [];
    this.isConnected = false;
    this.deviceName = null;
    this.lumens = 80; // 0 to 100% (Projection light intensity)
    this.screenBrightness = 90; // 0 to 100% (Display emission)
    this.scanning = false;
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
   * Connect to a simulated device.
   * @param {string} deviceName
   */
  async connect(deviceName) {
    this.setScanning(true);
    // Simulate connection lag (e.g. handshakes, pairing BLE)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    this.isConnected = true;
    this.deviceName = deviceName;
    this.scanning = false;
    this.notify();
    console.log(`[BluetoothObserver] Connected successfully to BLE device: ${deviceName}`);
  }

  /**
   * Disconnect the current device.
   */
  disconnect() {
    console.log(`[BluetoothObserver] Disconnected from BLE device: ${this.deviceName}`);
    this.isConnected = false;
    this.deviceName = null;
    this.scanning = false;
    this.notify();
  }

  /**
   * Adjust projection lumens (intensity of the light source).
   * @param {number} value (0-100)
   */
  setLumens(value) {
    const clampedVal = Math.max(0, Math.min(100, Number(value)));
    this.lumens = clampedVal;
    this.notify();
  }

  /**
   * Adjust screen brightness.
   * @param {number} value (0-100)
   */
  setScreenBrightness(value) {
    const clampedVal = Math.max(0, Math.min(100, Number(value)));
    this.screenBrightness = clampedVal;
    this.notify();
  }
}

// Export a single instance to be used as a global system-wide subject (Singleton Subject)
export const bluetoothService = new BluetoothObserverService();
