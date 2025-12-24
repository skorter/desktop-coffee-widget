const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appWindow', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close:    () => ipcRenderer.send('window:close'),
});
