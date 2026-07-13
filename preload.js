const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('weatherApi', {
  getWeather: () => ipcRenderer.invoke('weather:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (partial) => ipcRenderer.invoke('settings:set', partial),
});
