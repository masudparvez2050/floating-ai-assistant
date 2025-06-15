const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  // Settings management
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  loadSettings: () => ipcRenderer.invoke("load-settings"),

  // Chat functionality
  sendMessage: (provider, apiKey, message, model) =>
    ipcRenderer.invoke("send-ai-message", { provider, apiKey, message, model }),

  // Clipboard operations
  readClipboard: () => ipcRenderer.invoke("read-clipboard"),
  writeClipboard: (text) => ipcRenderer.invoke("write-clipboard", text),

  // System operations
  openExternal: (url) => ipcRenderer.invoke("open-external", url),

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", callback),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", callback),

  // Theme management
  setTheme: (theme) => ipcRenderer.invoke("set-theme", theme),
  getTheme: () => ipcRenderer.invoke("get-theme"),

  // Global shortcuts
  registerShortcut: (shortcut, action) =>
    ipcRenderer.invoke("register-shortcut", shortcut, action),
  unregisterShortcut: (shortcut) =>
    ipcRenderer.invoke("unregister-shortcut", shortcut),

  // System tray
  setTrayTooltip: (tooltip) => ipcRenderer.invoke("set-tray-tooltip", tooltip),
  showNotification: (title, body) =>
    ipcRenderer.invoke("show-notification", title, body),
});
