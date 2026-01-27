const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit'),
    setAdminMode: () => ipcRenderer.send('set-admin-mode'),
    setExamMode: () => ipcRenderer.send('set-exam-mode')
});
