const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getWishes: (type) => ipcRenderer.invoke('getWishes', type),
    exportData: () => ipcRenderer.invoke('export'),
    listen: (channel, func) => {
        ipcRenderer.on(channel, func);
    },
});
