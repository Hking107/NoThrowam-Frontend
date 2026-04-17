import { MapCommand, MapStateSnapshot, PurchaseState } from "../types/AIMessage";
import { MapCommand as ManagerMapCommand, MapStateSnapshot as ManagerMapStateSnapshot } from "../types/ManagerAgentChat";

// Customer Event Bus
export const CustomerMapBus = {
  _cmdListeners: [] as Array<(cmd: MapCommand) => void>,
  sendCommand(cmd: MapCommand) { 
    this._cmdListeners.forEach(fn => fn(cmd)); 
  },
  onCommand(fn: (cmd: MapCommand) => void) {
    this._cmdListeners.push(fn);
    return () => { this._cmdListeners = this._cmdListeners.filter(f => f !== fn); };
  },
  registerStateProvider(fn: () => MapStateSnapshot) { 
    (window as any).__custMapState = fn; 
  },
  getState(): MapStateSnapshot {
    const p = (window as any).__custMapState;
    return p ? p() : { points: [], cart: [] };
  },
};

export const PurchaseBus = {
  _listeners: [] as Array<(s: PurchaseState) => void>,
  _state: { phase: "idle" } as PurchaseState,
  setState(s: PurchaseState) { 
    this._state = s; 
    this._listeners.forEach(fn => fn(s)); 
  },
  getState() { 
    return this._state; 
  },
  onChange(fn: (s: PurchaseState) => void) {
    this._listeners.push(fn);
    return () => { this._listeners = this._listeners.filter(f => f !== fn); };
  },
};

// Manager Event Bus
export const ManagerMapBus = {
  _cmdListeners: [] as Array<(cmd: ManagerMapCommand) => void>,
  sendCommand(cmd: ManagerMapCommand) { 
    this._cmdListeners.forEach(fn => fn(cmd)); 
  },
  onCommand(fn: (cmd: ManagerMapCommand) => void) {
    this._cmdListeners.push(fn);
    return () => { this._cmdListeners = this._cmdListeners.filter(f => f !== fn); };
  },
  registerStateProvider(fn: () => ManagerMapStateSnapshot) { 
    (window as any).__mgrMapState = fn; 
  },
  getState(): ManagerMapStateSnapshot {
    const p = (window as any).__mgrMapState;
    return p ? p() : { points: [] };
  },
};
