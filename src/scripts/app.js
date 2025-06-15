// Main Application Controller
class FloatingAIApp {
  constructor() {
    this.currentTheme = "dark";
    this.isSettingsOpen = false;
    this.settings = {};
    this.selectedText = "";

    this.init();
  }

  async init() {
    try {
      // Load saved settings
      await this.loadSettings();

      // Initialize UI components
      this.initializeWindowControls();
      this.initializeTheme();
      this.setupEventListeners();

      // Initialize modules
      if (window.ChatManager) {
        this.chatManager = new ChatManager(this.settings);
      }

      if (window.SettingsManager) {
        this.settingsManager = new SettingsManager(this.settings);
      }

      if (window.ShortcutsManager) {
        this.shortcutsManager = new ShortcutsManager();
      }

      // Check for updates
      this.checkForUpdates();

      console.log("Floating AI Assistant initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showNotification(
        "Error",
        "Failed to initialize application",
        "error"
      );
    }
  }

  async loadSettings() {
    try {
      const savedSettings = await window.electronAPI.loadSettings();
      this.settings = {
        // Default settings
        aiProvider: "openai",
        apiKeys: {
          openai: "",
          gemini: "",
          claude: "",
        },
        model: "gpt-4-turbo",
        temperature: 0.7,
        maxTokens: 2048,
        theme: "dark",
        alwaysOnTop: true,
        windowOpacity: 0.95,
        // Merge with saved settings
        ...savedSettings,
      };

      // Apply theme
      this.currentTheme = this.settings.theme;
      this.applyTheme(this.currentTheme);
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Use default settings
      this.settings = {
        aiProvider: "openai",
        apiKeys: { openai: "", gemini: "", claude: "" },
        model: "gpt-4-turbo",
        temperature: 0.7,
        maxTokens: 2048,
        theme: "dark",
        alwaysOnTop: true,
        windowOpacity: 0.95,
      };
    }
  }

  async saveSettings() {
    try {
      await window.electronAPI.saveSettings(this.settings);
      this.showNotification(
        "Success",
        "Settings saved successfully",
        "success"
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.showNotification("Error", "Failed to save settings", "error");
    }
  }

  initializeWindowControls() {
    // Window control buttons
    const minimizeBtn = document.getElementById("minimizeBtn");
    const maximizeBtn = document.getElementById("maximizeBtn");
    const closeBtn = document.getElementById("closeBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const themeBtn = document.getElementById("themeBtn");

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        window.electronAPI.minimizeWindow();
      });
    }

    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", () => {
        window.electronAPI.maximizeWindow();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        window.electronAPI.closeWindow();
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        this.toggleSettings();
      });
    }

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
  }

  initializeTheme() {
    // Apply saved theme
    this.applyTheme(this.currentTheme);

    // Update theme button icon
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
      const icon = themeBtn.querySelector("i");
      if (icon) {
        icon.className =
          this.currentTheme === "light" ? "fas fa-sun" : "fas fa-moon";
      }
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;

    // Update theme button
    const themeBtn = document.getElementById("themeBtn");
    if (themeBtn) {
      const icon = themeBtn.querySelector("i");
      if (icon) {
        icon.className = theme === "light" ? "fas fa-sun" : "fas fa-moon";
      }
    }

    // Save theme preference
    this.settings.theme = theme;
    window.electronAPI.setTheme(theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
    this.saveSettings();
  }

  toggleSettings() {
    const chatInterface = document.getElementById("chatInterface");
    const settingsPanel = document.getElementById("settingsPanel");

    if (!chatInterface || !settingsPanel) return;

    this.isSettingsOpen = !this.isSettingsOpen;

    if (this.isSettingsOpen) {
      chatInterface.style.display = "none";
      settingsPanel.style.display = "flex";
      settingsPanel.classList.add("slide-in-right");

      // Load current settings into form
      if (this.settingsManager) {
        this.settingsManager.loadCurrentSettings();
      }
    } else {
      settingsPanel.classList.add("slide-out-right");
      setTimeout(() => {
        settingsPanel.style.display = "none";
        settingsPanel.classList.remove("slide-out-right", "slide-in-right");
        chatInterface.style.display = "flex";
      }, 300);
    }
  }

  setupEventListeners() {
    // Settings panel close button
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => {
        this.toggleSettings();
      });
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+S - Toggle Settings
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        this.toggleSettings();
      }

      // Ctrl+Shift+T - Toggle Theme
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault();
        this.toggleTheme();
      }

      // Escape - Close Settings
      if (e.key === "Escape" && this.isSettingsOpen) {
        e.preventDefault();
        this.toggleSettings();
      }
    });

    // Window resize handler
    window.addEventListener("resize", () => {
      this.handleWindowResize();
    });

    // Handle clipboard detection
    this.setupClipboardDetection();
  }
  setupClipboardDetection() {
    // Check clipboard on focus
    window.addEventListener("focus", async () => {
      try {
        const clipboardText = await window.electronAPI.readClipboard();
        // Only treat as selected text if it's substantial content and different from current
        if (
          clipboardText &&
          clipboardText.trim() &&
          clipboardText.trim() !== this.selectedText &&
          clipboardText.length > 20 && // More than just model names
          !clipboardText.includes("gemini-") && // Don't treat model names as selected text
          !clipboardText.includes("gpt-") &&
          !clipboardText.includes("claude-")
        ) {
          this.handleSelectedText(clipboardText);
        }
      } catch (error) {
        console.warn("Could not read clipboard:", error);
      }
    });
  }
  handleSelectedText(text) {
    if (!text || text.length < 20) return; // Ignore short text

    // Don't treat single words or model names as selected text
    const trimmedText = text.trim();
    if (trimmedText.split(" ").length < 3) return; // Must be at least 3 words

    this.selectedText = trimmedText;

    // Show selected text banner
    const banner = document.getElementById("selectedTextBanner");
    const bannerText = document.querySelector(".banner-text");

    if (banner && bannerText) {
      bannerText.textContent = `Selected: "${text.substring(0, 50)}${
        text.length > 50 ? "..." : ""
      }"`;
      banner.style.display = "block";
      banner.classList.add("fade-in");
    }

    // Update chat manager with selected text
    if (this.chatManager) {
      this.chatManager.setSelectedText(this.selectedText);
    }
  }

  clearSelectedText() {
    this.selectedText = "";

    const banner = document.getElementById("selectedTextBanner");
    if (banner) {
      banner.classList.add("fade-out");
      setTimeout(() => {
        banner.style.display = "none";
        banner.classList.remove("fade-out", "fade-in");
      }, 300);
    }

    if (this.chatManager) {
      this.chatManager.setSelectedText("");
    }
  }

  handleWindowResize() {
    // Handle responsive design changes
    const width = window.innerWidth;

    if (width < 480) {
      document.body.classList.add("mobile");
    } else {
      document.body.classList.remove("mobile");
    }
  }

  async checkForUpdates() {
    try {
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.warn("Could not check for updates:", error);
    }
  }

  showNotification(title, message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

    // Add to DOM
    document.body.appendChild(notification);

    // Add event listener for close button
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => {
      this.hideNotification(notification);
    });

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);

    // Show notification
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);
  }

  hideNotification(notification) {
    notification.classList.add("hide");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  // Utility methods
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  formatTime(date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new FloatingAIApp();
});

// Add notification styles
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-medium);
    padding: var(--spacing-md);
    box-shadow: var(--shadow-large);
    z-index: 10000;
    max-width: 300px;
    transform: translateX(350px);
    transition: all var(--transition-normal);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.notification.show {
    transform: translateX(0);
}

.notification.hide {
    transform: translateX(350px);
    opacity: 0;
}

.notification-info {
    border-left: 4px solid var(--primary-color);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-warning {
    border-left: 4px solid var(--warning-color);
}

.notification-error {
    border-left: 4px solid var(--error-color);
}

.notification-content {
    flex: 1;
}

.notification-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
}

.notification-message {
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.4;
}

.notification-close {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    border-radius: var(--radius-small);
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
}

.notification-close:hover {
    background: var(--error-color);
    color: white;
}
</style>
`;

document.head.insertAdjacentHTML("beforeend", notificationStyles);
