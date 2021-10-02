const nativeIPC = window.ipc;

const VALID_CALLBACKS = [
  'select-dirs-evt',
  'url-download-evt'
];

export const CALLBACKS = {
  SELECT_DIRS_EVENT: 'select-dirs-evt',
  URL_DOWNLOAD_EVENT: 'url-download-evt'
};

export const MESSAGES = {
  SELECT_DIRS: 'select-dirs'
};

export class IPC {
  constructor() {
    this.callbacks = {
      [CALLBACKS.URL_DOWNLOAD_EVENT]: [],
      [CALLBACKS.SELECT_DIRS_EVENT]: []
    };

    nativeIPC.listen('fromMainProcess', (payload) => {
      const callbacksToInvoke = this.callbacks[payload.type] || [];
      callbacksToInvoke.forEach((cb) => cb(payload));
    });
  }

  send(message) {
    nativeIPC.send('toMainProcess', message);
  }

  receiveOnce(cb) {
    nativeIPC.receiveOnce('fromMainProcess', cb);
  }

  listenFor(messageType, cb) {
    // we ensure that we register the listener only once by
    // adding a layer of indirection with callback registration

    if (!VALID_CALLBACKS.includes(messageType)) {
      throw new Error('Invalid type:', messageType);
    }

    this.callbacks[messageType].push(cb);
  }

  stopListeningFor(messageType, cb) {
    if (!VALID_CALLBACKS.includes(messageType)) {
      throw new Error('Invalid type:', messageType);
    }

    const elementIndex = this.callbacks[messageType].indexOf(cb);

    if (elementIndex !== -1) {
      return;
    }

    this.callbacks[messageType].splice(elementIndex, 1);
  }
}

export default new IPC();
