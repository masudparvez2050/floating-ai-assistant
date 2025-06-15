// Settings Manager - Handles all settings functionality
class SettingsManager {
  constructor(settings) {
    this.settings = settings;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadCurrentSettings();
  }

  setupEventListeners() {
    // Save settings button
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        this.saveSettings();
      });
    }

    // Reset settings button
    const resetSettingsBtn = document.getElementById("resetSettingsBtn");
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener("click", () => {
        this.resetSettings();
      });
    }

    // Provider radio buttons
    const providerRadios = document.querySelectorAll(
      'input[name="aiProvider"]'
    );
    providerRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.updateModelOptions(e.target.value);
        }
      });
    });

    // API key visibility toggles
    const toggleButtons = document.querySelectorAll(".toggle-visibility");
    toggleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.togglePasswordVisibility(e.target.closest("button"));
      });
    });

    // Temperature slider
    const temperatureSlider = document.getElementById("temperatureSlider");
    const temperatureValue = document.getElementById("temperatureValue");
    if (temperatureSlider && temperatureValue) {
      temperatureSlider.addEventListener("input", (e) => {
        temperatureValue.textContent = e.target.value;
      });
    }

    // Opacity slider
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityValue = document.getElementById("opacityValue");
    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener("input", (e) => {
        const value = Math.round(e.target.value * 100);
        opacityValue.textContent = value + "%";
        this.updateWindowOpacity(e.target.value);
      });
    }

    // Always on top toggle
    const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
    if (alwaysOnTopToggle) {
      alwaysOnTopToggle.addEventListener("change", (e) => {
        // Note: This feature might not be available in Chrome extension context
        console.log("Always on top:", e.target.checked);
      });
    }

    // Theme selector buttons
    const themeOptions = document.querySelectorAll(".theme-option");
    themeOptions.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectTheme(e.target.closest(".theme-option"));
      });
    });

    // About section buttons
    const checkUpdatesBtn = document.getElementById("checkUpdatesBtn");
    const feedbackBtn = document.getElementById("feedbackBtn");
    const websiteBtn = document.getElementById("websiteBtn");

    if (checkUpdatesBtn) {
      checkUpdatesBtn.addEventListener("click", () => {
        this.checkForUpdates();
      });
    }

    if (feedbackBtn) {
      feedbackBtn.addEventListener("click", () => {
        this.openFeedback();
      });
    }

    if (websiteBtn) {
      websiteBtn.addEventListener("click", () => {
        this.openWebsite();
      });
    }
  }

  loadCurrentSettings() {
    // Load AI provider
    const providerRadio = document.querySelector(
      `input[name="aiProvider"][value="${this.settings.aiProvider}"]`
    );
    if (providerRadio) {
      providerRadio.checked = true;
      this.updateModelOptions(this.settings.aiProvider);
    }

    // Load API keys
    const openaiKey = document.getElementById("openaiKey");
    const geminiKey = document.getElementById("geminiKey");
    const claudeKey = document.getElementById("claudeKey");

    if (openaiKey) openaiKey.value = this.settings.apiKeys.openai || "";
    if (geminiKey) geminiKey.value = this.settings.apiKeys.gemini || "";
    if (claudeKey) claudeKey.value = this.settings.apiKeys.claude || "";

    // Load model settings
    const modelSelect = document.getElementById("modelSelect");
    if (modelSelect) {
      modelSelect.value = this.settings.model || "gpt-4-turbo";
    }

    const temperatureSlider = document.getElementById("temperatureSlider");
    const temperatureValue = document.getElementById("temperatureValue");
    if (temperatureSlider && temperatureValue) {
      temperatureSlider.value = this.settings.temperature || 0.7;
      temperatureValue.textContent = this.settings.temperature || 0.7;
    }

    const maxTokensInput = document.getElementById("maxTokensInput");
    if (maxTokensInput) {
      maxTokensInput.value = this.settings.maxTokens || 2048;
    }

    // Load appearance settings
    const opacitySlider = document.getElementById("opacitySlider");
    const opacityValue = document.getElementById("opacityValue");
    if (opacitySlider && opacityValue) {
      const opacity = this.settings.windowOpacity || 0.95;
      opacitySlider.value = opacity;
      opacityValue.textContent = Math.round(opacity * 100) + "%";
    }

    const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
    if (alwaysOnTopToggle) {
      alwaysOnTopToggle.checked = this.settings.alwaysOnTop !== false;
    }

    // Load theme
    this.updateThemeButtons(this.settings.theme || "dark");
  }

  updateModelOptions(provider) {
    const modelSelect = document.getElementById("modelSelect");
    if (!modelSelect) return;

    // Clear existing options
    modelSelect.innerHTML = "";

    const modelOptions = {
      openai: [
        { value: "gpt-4-turbo", text: "GPT-4 Turbo" },
        { value: "gpt-4", text: "GPT-4" },
        { value: "gpt-3.5-turbo", text: "GPT-3.5 Turbo" },
      ],
      gemini: [
        { value: "gemini-2.0-flash-lite", text: "Gemini Pro" },
        { value: "gemini-2.0-flash-lite", text: "Gemini Pro Vision" },
      ],
      claude: [
        { value: "claude-3-sonnet-20240229", text: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", text: "Claude 3 Haiku" },
        { value: "claude-2.1", text: "Claude 2.1" },
      ],
    };

    const options = modelOptions[provider] || modelOptions.openai;
    options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.text;
      modelSelect.appendChild(optionEl);
    });

    // Set default selection
    if (this.settings.model) {
      modelSelect.value = this.settings.model;
    }
  }

  togglePasswordVisibility(button) {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);
    const icon = button.querySelector("i");

    if (input && icon) {
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fas fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fas fa-eye";
      }
    }
  }

  updateWindowOpacity(opacity) {
    document.body.style.opacity = opacity;

    // Save to settings
    this.settings.windowOpacity = parseFloat(opacity);
  }

  selectTheme(button) {
    const theme = button.getAttribute("data-theme");

    // Update active state
    this.updateThemeButtons(theme);

    // Apply theme
    if (window.app) {
      window.app.applyTheme(theme);
    }
  }

  updateThemeButtons(selectedTheme) {
    const themeOptions = document.querySelectorAll(".theme-option");
    themeOptions.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-theme") === selectedTheme) {
        btn.classList.add("active");
      }
    });
  }

  saveSettings() {
    try {
      // Collect all settings from form
      const newSettings = { ...this.settings };

      // AI Provider
      const selectedProvider = document.querySelector(
        'input[name="aiProvider"]:checked'
      );
      if (selectedProvider) {
        newSettings.aiProvider = selectedProvider.value;
      }

      // API Keys
      const openaiKey = document.getElementById("openaiKey");
      const geminiKey = document.getElementById("geminiKey");
      const claudeKey = document.getElementById("claudeKey");

      newSettings.apiKeys = {
        openai: openaiKey ? openaiKey.value : "",
        gemini: geminiKey ? geminiKey.value : "",
        claude: claudeKey ? claudeKey.value : "",
      };

      // Model settings
      const modelSelect = document.getElementById("modelSelect");
      const temperatureSlider = document.getElementById("temperatureSlider");
      const maxTokensInput = document.getElementById("maxTokensInput");

      if (modelSelect) newSettings.model = modelSelect.value;
      if (temperatureSlider)
        newSettings.temperature = parseFloat(temperatureSlider.value);
      if (maxTokensInput)
        newSettings.maxTokens = parseInt(maxTokensInput.value);

      // Appearance settings
      const opacitySlider = document.getElementById("opacitySlider");
      const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
      const activeTheme = document.querySelector(".theme-option.active");

      if (opacitySlider)
        newSettings.windowOpacity = parseFloat(opacitySlider.value);
      if (alwaysOnTopToggle)
        newSettings.alwaysOnTop = alwaysOnTopToggle.checked;
      if (activeTheme)
        newSettings.theme = activeTheme.getAttribute("data-theme");

      // Update app settings
      this.settings = newSettings;

      // Save to electron store
      if (window.app) {
        window.app.settings = newSettings;
        window.app.saveSettings();
      }

      // Update chat manager
      if (window.app && window.app.chatManager) {
        window.app.chatManager.updateSettings(newSettings);
      }

      window.app.showNotification(
        "Success",
        "Settings saved successfully!",
        "success"
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      window.app.showNotification("Error", "Failed to save settings", "error");
    }
  }

  resetSettings() {
    if (
      confirm(
        "Are you sure you want to reset all settings to defaults? This action cannot be undone."
      )
    ) {
      // Reset to default settings
      const defaultSettings = {
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
      };

      this.settings = defaultSettings;

      // Update app settings
      if (window.app) {
        window.app.settings = defaultSettings;
        window.app.saveSettings();
        window.app.applyTheme("dark");
      }

      // Reload form with default values
      this.loadCurrentSettings();

      // Update chat manager
      if (window.app && window.app.chatManager) {
        window.app.chatManager.updateSettings(defaultSettings);
      }

      window.app.showNotification(
        "Success",
        "Settings reset to defaults",
        "success"
      );
    }
  }

  async checkForUpdates() {
    try {
      window.app.showNotification("Info", "Checking for updates...", "info");
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error("Failed to check for updates:", error);
      window.app.showNotification(
        "Error",
        "Failed to check for updates",
        "error"
      );
    }
  }

  openFeedback() {
    const feedbackUrl =
      "mailto:contact@codevionix.com?subject=Floating%20AI%20Assistant%20Feedback&body=Please%20share%20your%20feedback%20about%20the%20Floating%20AI%20Assistant...";
    window.electronAPI.openExternal(feedbackUrl);
  }

  openWebsite() {
    window.electronAPI.openExternal("https://masudur-rahman.vercel.app");
  }

  // Validate API key format
  validateApiKey(provider, key) {
    if (!key) return false;

    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      gemini: /^AI[a-zA-Z0-9_-]{35,}$/,
      claude: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
    };

    const pattern = patterns[provider];
    return pattern ? pattern.test(key) : key.length > 10;
  }

  // Get model display name
  getModelDisplayName(model) {
    const displayNames = {
      "gpt-4-turbo": "GPT-4 Turbo",
      "gpt-4": "GPT-4",
      "gpt-3.5-turbo": "GPT-3.5 Turbo",
      "gemini-2.0-flash-lite": "Gemini Pro",
      "gemini-2.0-flash-lite": "Gemini Pro Vision",
      "claude-3-sonnet-20240229": "Claude 3 Sonnet",
      "claude-3-haiku-20240307": "Claude 3 Haiku",
      "claude-2.1": "Claude 2.1",
    };

    return displayNames[model] || model;
  }

  // Export settings
  exportSettings() {
    try {
      const settingsToExport = {
        ...this.settings,
        apiKeys: {
          openai: "***",
          gemini: "***",
          claude: "***",
        },
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const jsonString = JSON.stringify(settingsToExport, null, 2);
      window.electronAPI.writeClipboard(jsonString);

      window.app.showNotification(
        "Success",
        "Settings exported to clipboard (API keys hidden)",
        "success"
      );
    } catch (error) {
      console.error("Failed to export settings:", error);
      window.app.showNotification(
        "Error",
        "Failed to export settings",
        "error"
      );
    }
  }
}

// Make available globally
window.SettingsManager = SettingsManager;
