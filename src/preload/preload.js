const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld("electronAPI", {
    createAccount: (accountData) => ipcRenderer.invoke("create-account", accountData),
    deleteAccount: (accountName) => ipcRenderer.invoke("delete-account", accountName),
    generateOtp: (secret) => ipcRenderer.invoke("generate-otp", secret),
    loadAccounts: () => ipcRenderer.invoke("load-accounts"),
    quit: () => ipcRenderer.invoke("quit"),
    minimize: () => ipcRenderer.invoke("minimize"),
    onResetScroll: (callback) => ipcRenderer.on("reset-scroll", callback)
});