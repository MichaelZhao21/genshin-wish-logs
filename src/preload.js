const { contextBridge, ipcRenderer } = require('electron');

window.onload = () => {
    document.getElementById('backend-text').innerHTML = 'WOW THIS IS FROM THE "BACKEND"';
};

contextBridge.exposeInMainWorld('api', {
    getWishes: () => ipcRenderer.invoke('getWishes'),
});
