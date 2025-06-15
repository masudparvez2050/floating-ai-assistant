const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Menu,
  Tray,
  globalShortcut,
  shell,
} = require("electron");
const path = require("path");
const Store = require("electron-store");
const AIService = require("./ai-service");

// Initialize electron store for settings
const store = new Store();
const aiService = new AIService();

class FloatingAIAssistant {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.isQuitting = false;

    this.initializeApp();
  }

  initializeApp() {
    // App event listeners
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.registerGlobalShortcuts();
      this.createMenuBar();
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on("before-quit", () => {
      this.isQuitting = true;
    });

    // IPC handlers
    this.setupIpcHandlers();
  }

  createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    // Get saved window position or use default
    const savedBounds = store.get("windowBounds", {
      x: width - 420,
      y: 100,
      width: 400,
      height: 600,
    });

    this.mainWindow = new BrowserWindow({
      ...savedBounds,
      minWidth: 350,
      minHeight: 400,
      maxWidth: 600,
      maxHeight: 800,
      frame: false,
      transparent: true,
      alwaysOnTop: store.get("alwaysOnTop", true),
      skipTaskbar: false,
      resizable: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "..", "assets", "icon.png"),
      show: false,
      titleBarStyle: "hidden",
    }); // Load the main UI
    this.mainWindow.loadFile("src/index.html");

    // Window event handlers
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow.show();

      // Focus on the input field
      this.mainWindow.webContents.executeJavaScript(`
        setTimeout(() => {
          const input = document.getElementById('messageInput');
          if (input) input.focus();
        }, 100);
      `);
    });

    // Save window bounds when moved or resized
    this.mainWindow.on("moved", () => this.saveWindowBounds());
    this.mainWindow.on("resized", () => this.saveWindowBounds());

    // Handle window close
    this.mainWindow.on("close", (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    // Development tools
    if (process.argv.includes("--dev")) {
      this.mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  }

  createTray() {
    this.tray = new Tray(path.join(__dirname, "..", "assets", "tray-icon.png"));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show Assistant",
        click: () => {
          this.mainWindow.show();
          this.mainWindow.focus();
        },
      },
      {
        label: "Settings",
        click: () => {
          this.showSettings();
        },
      },
      { type: "separator" },
      {
        label: "Always on Top",
        type: "checkbox",
        checked: store.get("alwaysOnTop", true),
        click: (item) => {
          store.set("alwaysOnTop", item.checked);
          this.mainWindow.setAlwaysOnTop(item.checked);
        },
      },
      { type: "separator" },
      {
        label: "About",
        click: () => {
          shell.openExternal("https://masudur-rahman.vercel.app");
        },
      },
      {
        label: "Quit",
        click: () => {
          this.isQuitting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setToolTip("Floating AI Assistant");
    this.tray.setContextMenu(contextMenu);

    // Double click to show/hide
    this.tray.on("double-click", () => {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });
  }

  createMenuBar() {
    const template = [
      {
        label: "File",
        submenu: [
          {
            label: "New Chat",
            accelerator: "CmdOrCtrl+N",
            click: () => {
              this.mainWindow.webContents.send("clear-chat");
            },
          },
          { type: "separator" },
          {
            label: "Settings",
            accelerator: "CmdOrCtrl+,",
            click: () => {
              this.showSettings();
            },
          },
          { type: "separator" },
          {
            label: "Quit",
            accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
            click: () => {
              this.isQuitting = true;
              app.quit();
            },
          },
        ],
      },
      {
        label: "View",
        submenu: [
          {
            label: "Toggle Always on Top",
            accelerator: "CmdOrCtrl+T",
            click: () => {
              const current = this.mainWindow.isAlwaysOnTop();
              this.mainWindow.setAlwaysOnTop(!current);
              store.set("alwaysOnTop", !current);
            },
          },
          {
            label: "Minimize to Tray",
            accelerator: "CmdOrCtrl+H",
            click: () => {
              this.mainWindow.hide();
            },
          },
          { type: "separator" },
          {
            label: "Reload",
            accelerator: "CmdOrCtrl+R",
            click: () => {
              this.mainWindow.reload();
            },
          },
        ],
      },
      {
        label: "Help",
        submenu: [
          {
            label: "About",
            click: () => {
              shell.openExternal("https://masudur-rahman.vercel.app");
            },
          },
          {
            label: "Documentation",
            click: () => {
              shell.openExternal(
                "https://github.com/codevionix/floating-ai-assistant"
              );
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  registerGlobalShortcuts() {
    // Global shortcut to show/hide assistant
    globalShortcut.register("Alt+Space", () => {
      if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });

    // Global shortcut for quick AI query
    globalShortcut.register("Alt+A", () => {
      this.mainWindow.show();
      this.mainWindow.focus();
      this.mainWindow.webContents.send("focus-input");
    });
  }
  setupIpcHandlers() {
    // Window controls
    ipcMain.handle("minimize-window", () => {
      this.mainWindow.minimize();
    });

    ipcMain.handle("close-window", () => {
      this.mainWindow.hide();
    });

    ipcMain.handle("maximize-window", () => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    });

    // Settings
    ipcMain.handle("get-setting", (event, key, defaultValue) => {
      return store.get(key, defaultValue);
    });

    ipcMain.handle("set-setting", (event, key, value) => {
      store.set(key, value);
    });

    ipcMain.handle("get-all-settings", () => {
      return store.store;
    });

    // Always on top
    ipcMain.handle("set-always-on-top", (event, alwaysOnTop) => {
      this.mainWindow.setAlwaysOnTop(alwaysOnTop);
      store.set("alwaysOnTop", alwaysOnTop);
    }); // Open external links
    ipcMain.handle("open-external", (event, url) => {
      shell.openExternal(url);
    }); // AI service integration
    ipcMain.handle(
      "send-ai-message",
      async (event, { provider, apiKey, message, model }) => {
        try {
          const response = await aiService.sendMessage(
            provider,
            apiKey,
            message,
            model
          );
          return { success: true, data: response };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }
    );

    // Clipboard operations
    ipcMain.handle("read-clipboard", () => {
      const { clipboard } = require("electron");
      return clipboard.readText();
    });
    ipcMain.handle("write-clipboard", (event, text) => {
      const { clipboard } = require("electron");
      clipboard.writeText(text);
    }); // Load settings handler
    ipcMain.handle("load-settings", () => {
      return store.store;
    });

    // Save settings handler
    ipcMain.handle("save-settings", (event, settings) => {
      for (const [key, value] of Object.entries(settings)) {
        store.set(key, value);
      }
      return { success: true };
    });

    // Theme handler
    ipcMain.handle("set-theme", (event, theme) => {
      store.set("theme", theme);
      return true;
    });

    // Shortcut registration handlers
    ipcMain.handle("register-shortcut", (event, accelerator, action) => {
      try {
        globalShortcut.register(accelerator, () => {
          this.mainWindow.webContents.send("shortcut-triggered", action);
        });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }); // Update checker (placeholder)
    ipcMain.handle("check-for-updates", async () => {
      // Placeholder for future update functionality
      return { hasUpdate: false, version: "1.0.0" };
    });

    ipcMain.handle("get-theme", () => {
      return store.get("theme", "light");
    });

    ipcMain.handle("unregister-shortcut", (event, shortcut) => {
      try {
        globalShortcut.unregister(shortcut);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle("set-tray-tooltip", (event, tooltip) => {
      if (this.tray) {
        this.tray.setToolTip(tooltip);
        return true;
      }
      return false;
    });

    ipcMain.handle("show-notification", (event, title, body) => {
      const { Notification } = require("electron");
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
      return false;
    });
  }

  saveWindowBounds() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      const bounds = this.mainWindow.getBounds();
      store.set("windowBounds", bounds);
    }
  }

  showSettings() {
    this.mainWindow.webContents.send("show-settings");
  }
}

// Initialize the app
new FloatingAIAssistant();
