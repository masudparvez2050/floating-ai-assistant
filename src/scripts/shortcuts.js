// Shortcuts Manager - Handles keyboard shortcuts and global hotkeys
class ShortcutsManager {
  constructor() {
    this.shortcuts = new Map();
    this.init();
  }

  init() {
    this.registerDefaultShortcuts();
    this.setupGlobalListeners();
  }

  registerDefaultShortcuts() {
    // Register application shortcuts
    this.registerShortcut("Ctrl+/", "focus-input", () => {
      this.focusMessageInput();
    });

    this.registerShortcut("Ctrl+Shift+C", "clear-chat", () => {
      if (window.app && window.app.chatManager) {
        window.app.chatManager.clearChat();
      }
    });

    this.registerShortcut("Ctrl+Shift+S", "toggle-settings", () => {
      if (window.app) {
        window.app.toggleSettings();
      }
    });

    this.registerShortcut("Ctrl+Shift+T", "toggle-theme", () => {
      if (window.app) {
        window.app.toggleTheme();
      }
    });

    this.registerShortcut("Ctrl+Shift+E", "export-chat", () => {
      if (window.app && window.app.chatManager) {
        window.app.chatManager.exportChat();
      }
    });

    this.registerShortcut("Ctrl+Shift+V", "paste-clipboard", () => {
      if (window.app && window.app.chatManager) {
        window.app.chatManager.pasteFromClipboard();
      }
    });

    this.registerShortcut("F1", "show-help", () => {
      this.showHelpDialog();
    });

    // Global shortcuts (handled by Electron main process)
    this.registerGlobalShortcut("Ctrl+Shift+A", "toggle-window");
    this.registerGlobalShortcut("Ctrl+Alt+Space", "quick-capture");
  }

  registerShortcut(combination, action, handler) {
    const shortcut = {
      combination,
      action,
      handler,
      keys: this.parseShortcut(combination),
    };

    this.shortcuts.set(combination, shortcut);
    console.log(`Registered shortcut: ${combination} -> ${action}`);
  }

  registerGlobalShortcut(combination, action) {
    try {
      window.electronAPI.registerShortcut(combination, action);
      console.log(`Registered global shortcut: ${combination} -> ${action}`);
    } catch (error) {
      console.warn(`Failed to register global shortcut ${combination}:`, error);
    }
  }

  parseShortcut(combination) {
    const parts = combination.toLowerCase().split("+");
    return {
      ctrl: parts.includes("ctrl"),
      shift: parts.includes("shift"),
      alt: parts.includes("alt"),
      meta: parts.includes("meta") || parts.includes("cmd"),
      key: parts[parts.length - 1],
    };
  }

  setupGlobalListeners() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    // Prevent default browser shortcuts that might interfere
    document.addEventListener("keydown", (e) => {
      // Prevent Ctrl+R (refresh) and F5
      if ((e.ctrlKey && e.key === "r") || e.key === "F5") {
        e.preventDefault();
      }

      // Prevent Ctrl+Shift+I (dev tools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
      }

      // Prevent Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
      }
    });
  }

  handleKeyDown(e) {
    // Skip if typing in input fields
    if (this.isTypingInInput(e.target)) {
      return;
    }

    // Check each registered shortcut
    for (const [combination, shortcut] of this.shortcuts) {
      if (this.matchesShortcut(e, shortcut.keys)) {
        e.preventDefault();
        e.stopPropagation();

        try {
          shortcut.handler();
          console.log(`Executed shortcut: ${combination}`);
        } catch (error) {
          console.error(`Error executing shortcut ${combination}:`, error);
        }
        break;
      }
    }
  }

  matchesShortcut(event, keys) {
    // Normalize key names
    const eventKey = event.key.toLowerCase();
    const targetKey = keys.key.toLowerCase();

    // Check modifiers
    const ctrlMatch = event.ctrlKey === keys.ctrl;
    const shiftMatch = event.shiftKey === keys.shift;
    const altMatch = event.altKey === keys.alt;
    const metaMatch = event.metaKey === keys.meta;

    // Check key
    let keyMatch = eventKey === targetKey;

    // Handle special keys
    if (targetKey === "/" && eventKey === "/") keyMatch = true;
    if (targetKey === "f1" && eventKey === "f1") keyMatch = true;

    return ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch;
  }

  isTypingInInput(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();

    return (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      element.contentEditable === "true" ||
      (tagName === "input" &&
        ["text", "password", "email", "search"].includes(type))
    );
  }

  focusMessageInput() {
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.focus();
      // Move cursor to end
      messageInput.setSelectionRange(
        messageInput.value.length,
        messageInput.value.length
      );
    }
  }

  showHelpDialog() {
    // Create help dialog
    const helpDialog = document.createElement("div");
    helpDialog.className = "help-dialog";
    helpDialog.innerHTML = `
            <div class="help-overlay"></div>
            <div class="help-content">
                <div class="help-header">
                    <h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>
                    <button class="help-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="help-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-category">
                            <h4>General</h4>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+A</kbd>
                                <span>Toggle window (global)</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+/</kbd>
                                <span>Focus message input</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Escape</kbd>
                                <span>Close settings/dialogs</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>F1</kbd>
                                <span>Show this help</span>
                            </div>
                        </div>
                        <div class="shortcut-category">
                            <h4>Chat</h4>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Enter</kbd>
                                <span>Send message</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+C</kbd>
                                <span>Clear chat</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+E</kbd>
                                <span>Export chat</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+V</kbd>
                                <span>Paste from clipboard</span>
                            </div>
                        </div>
                        <div class="shortcut-category">
                            <h4>Settings</h4>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+S</kbd>
                                <span>Toggle settings</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Ctrl+Shift+T</kbd>
                                <span>Toggle theme</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(helpDialog);

    // Add event listeners
    const closeBtn = helpDialog.querySelector(".help-close");
    const overlay = helpDialog.querySelector(".help-overlay");

    const closeDialog = () => {
      helpDialog.classList.add("fade-out");
      setTimeout(() => {
        if (helpDialog.parentNode) {
          helpDialog.parentNode.removeChild(helpDialog);
        }
      }, 300);
    };

    closeBtn.addEventListener("click", closeDialog);
    overlay.addEventListener("click", closeDialog);

    // Close with Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        closeDialog();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);

    // Show dialog with animation
    setTimeout(() => {
      helpDialog.classList.add("fade-in");
    }, 50);
  }

  unregisterShortcut(combination) {
    if (this.shortcuts.has(combination)) {
      this.shortcuts.delete(combination);
      console.log(`Unregistered shortcut: ${combination}`);
    }
  }

  unregisterGlobalShortcut(combination) {
    try {
      window.electronAPI.unregisterShortcut(combination);
      console.log(`Unregistered global shortcut: ${combination}`);
    } catch (error) {
      console.warn(
        `Failed to unregister global shortcut ${combination}:`,
        error
      );
    }
  }

  listShortcuts() {
    return Array.from(this.shortcuts.entries()).map(
      ([combination, shortcut]) => ({
        combination,
        action: shortcut.action,
      })
    );
  }

  // Handle messages from main process
  handleGlobalShortcut(action) {
    switch (action) {
      case "toggle-window":
        console.log("Global shortcut: toggle window");
        break;
      case "quick-capture":
        this.handleQuickCapture();
        break;
      default:
        console.log(`Unknown global shortcut action: ${action}`);
    }
  }

  handleQuickCapture() {
    // Quick capture functionality - get clipboard and start chat
    if (window.app && window.app.chatManager) {
      window.app.chatManager.pasteFromClipboard();
      this.focusMessageInput();
    }
  }
}

// Add help dialog styles
const helpDialogStyles = `
<style>
.help-dialog {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0;
    transition: opacity var(--transition-normal);
}

.help-dialog.fade-in {
    opacity: 1;
}

.help-dialog.fade-out {
    opacity: 0;
}

.help-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.help-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-large);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: var(--shadow-large);
}

.help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-primary);
}

.help-header h3 {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.help-header h3 i {
    color: var(--primary-color);
}

.help-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-medium);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.help-close:hover {
    background: var(--error-color);
    color: white;
}

.help-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
    max-height: 60vh;
}

.shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
}

.shortcut-category h4 {
    color: var(--text-primary);
    font-size: 16px;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-primary);
}

.shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    color: var(--text-secondary);
}

.shortcut-item:not(:last-child) {
    border-bottom: 1px solid var(--border-primary);
}

.shortcut-item kbd {
    background: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-small);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-family: monospace;
    font-size: 12px;
    color: var(--text-primary);
}

.shortcut-item span {
    font-size: 13px;
}

@media (max-width: 600px) {
    .shortcuts-grid {
        grid-template-columns: 1fr;
    }
    
    .help-content {
        width: 95%;
        max-height: 90vh;
    }
    
    .shortcut-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
    }
}
</style>
`;

document.head.insertAdjacentHTML("beforeend", helpDialogStyles);

// Make available globally
window.ShortcutsManager = ShortcutsManager;
