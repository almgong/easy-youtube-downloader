/**
 * Preloader
 *
 * Middle man between main and renderer process
 */

const { ipcRenderer, contextBridge } = require('electron');

// define interface for communication for web view
contextBridge.exposeInMainWorld(
  'ipc', {
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ["toMainProcess"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receiveOnce: (channel, cb) => {
      const validChannels = ["fromMainProcess"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => cb(...args));
      }
    },
    listen: (channel, cb) => {
      const validChannels = ["fromMainProcess"];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => cb(...args));
      }
    }
  }
);
