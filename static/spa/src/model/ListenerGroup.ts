import listenerGroupRegistry from './ListenerGroupRegistry';
import { uuid } from './util';

export default class ListenerGroup {

  registryName: string;
  listenerIdsToListeners: any = {};
  maxListenersCount = 0;

  constructor(registryName: string) {
    this.registryName = registryName;
    listenerGroupRegistry.addRegistry(this);
  }

  getListenerCount = () => {
    return Object.keys(this.listenerIdsToListeners).length;
  };

  getMaxListenerCount = () => {
    return this.maxListenersCount;
  };

  registerListener = (listener: any) => {
    if (typeof listener === 'function') {
      if (listener.listenerUuid) {
        // previously registered and possibly unregistered.
      }
      listener.listenerUuid = uuid();
      this.listenerIdsToListeners[listener.listenerUuid] = listener;
      const listenerCount = this.getListenerCount();
      if (listenerCount > this.maxListenersCount) {
        this.maxListenersCount = listenerCount;
      }
    } else {
      new Error('typeof listener is ' + (typeof listener) + ', not function.');
    }
  };

  unregisterListener = (listener: any) => {
    delete this.listenerIdsToListeners[listener.listenerUuid];
  };

  notifyListeners = (object: any, context?: any, synchronously?: boolean) => {
    if (synchronously === true) {
      this._notifyListeners(object, context);
    } else {
      setTimeout(() => {
        this._notifyListeners(object, context);       
      }, 0);
    }
  };

  _notifyListeners = (object: any, context: any) => {
    const uuids = Object.keys(this.listenerIdsToListeners);
    for (let i = 0; i < uuids.length; i++) {
      const uuid = uuids[i];
      const listener = this.listenerIdsToListeners[uuid];
      if (listener) {
        try {
          // console.log(`Notifying listener ${this.registryName}...`);
          listener(object, context);
        } catch (e) {
          console.error('Exception occurred in listener registry ' + this.registryName + ' whilst calling listener - typeof listener is ' + (typeof listener) + ': ', e);
        }
      } else {
        delete this.listenerIdsToListeners[uuid];
      }
    }
  };

}
