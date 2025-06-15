// Chat Manager - Handles all chat functionality
class ChatManager {
  constructor(settings) {
    this.settings = settings;
    this.messages = [];
    this.selectedText = "";
    this.isTyping = false;
    this.chatHistory = [];

    this.init();
  }

  init() {
    this.loadChatHistory();
    this.setupEventListeners();
    this.updateAIStatus();

    // Auto-resize textarea
    this.setupAutoResize();
  }

  setupEventListeners() {
    // Send button
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");

    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        this.sendMessage();
      });
    }

    // Message input
    if (messageInput) {
      messageInput.addEventListener("input", (e) => {
        this.handleInputChange(e);
      });

      messageInput.addEventListener("keydown", (e) => {
        // Ctrl+Enter to send
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault();
          this.sendMessage();
        }

        // Shift+Enter for new line (default behavior)
        // Regular Enter for new line in this case
      });

      // Focus input by default
      messageInput.focus();
    }

    // Clear chat button
    const clearChatBtn = document.getElementById("clearChatBtn");
    if (clearChatBtn) {
      clearChatBtn.addEventListener("click", () => {
        this.clearChat();
      });
    }

    // Export chat button
    const exportChatBtn = document.getElementById("exportChatBtn");
    if (exportChatBtn) {
      exportChatBtn.addEventListener("click", () => {
        this.exportChat();
      });
    }

    // Clear selected text button
    const clearSelectedText = document.getElementById("clearSelectedText");
    if (clearSelectedText) {
      clearSelectedText.addEventListener("click", () => {
        window.app.clearSelectedText();
      });
    }

    // Clipboard and clear input buttons
    const clipboardBtn = document.getElementById("clipboardBtn");
    const clearInputBtn = document.getElementById("clearInputBtn");

    if (clipboardBtn) {
      clipboardBtn.addEventListener("click", async () => {
        await this.pasteFromClipboard();
      });
    }

    if (clearInputBtn) {
      clearInputBtn.addEventListener("click", () => {
        this.clearInput();
      });
    }
  }

  setupAutoResize() {
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.addEventListener("input", () => {
        // Reset height to auto to get the correct scrollHeight
        messageInput.style.height = "auto";

        // Set height based on scrollHeight, with min and max limits
        const minHeight = 80;
        const maxHeight = 200;
        const newHeight = Math.min(
          Math.max(messageInput.scrollHeight, minHeight),
          maxHeight
        );

        messageInput.style.height = newHeight + "px";
      });
    }
  }

  handleInputChange(e) {
    const input = e.target;
    const sendBtn = document.getElementById("sendBtn");

    // Enable/disable send button based on input
    if (sendBtn) {
      sendBtn.disabled = !input.value.trim();
    }
  }
  setSelectedText(text) {
    this.selectedText = text && text.trim() ? text.trim() : "";
  }

  async sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    if (!messageInput || !messageInput.value.trim()) return;

    const message = messageInput.value.trim();
    const provider = this.settings.aiProvider;
    const apiKey = this.settings.apiKeys[provider];

    // Debug logging
    console.log("=== SEND MESSAGE DEBUG ===");
    console.log("User message:", message);
    console.log("Selected text:", this.selectedText);
    console.log(
      "Selected text length:",
      this.selectedText ? this.selectedText.length : 0
    );
    console.log(
      "Has selected text:",
      !!(this.selectedText && this.selectedText.trim())
    );

    // Validate API key
    if (!apiKey) {
      window.app.showNotification(
        "Error",
        `Please configure your ${provider.toUpperCase()} API key in settings`,
        "error"
      );
      return;
    }

    // Disable input and show loading
    messageInput.disabled = true;
    sendBtn.disabled = true;
    this.showTypingIndicator();

    try {
      // Add user message to chat
      this.addMessage("user", message);

      // Clear input
      messageInput.value = "";
      messageInput.style.height = "80px"; // Prepare enhanced message with selected text
      let enhancedMessage = message;
      if (this.selectedText && this.selectedText.trim()) {
        enhancedMessage = `Selected Text: "${this.selectedText}"\n\nUser Question: ${message}\n\nPlease analyze the selected text and respond to the user's question about it.`;
      } // Send to AI
      const response = await window.electronAPI.sendMessage(
        provider,
        apiKey,
        enhancedMessage,
        this.settings.model
      ); // Check if response was successful
      if (response.success) {
        // Add AI response to chat
        this.addMessage("ai", response.data);

        // Clear selected text after successful AI response
        if (this.selectedText && this.selectedText.trim()) {
          window.app.clearSelectedText();
        }
      } else {
        // Handle error response
        throw new Error(response.error || "Unknown error occurred");
      }

      // Save to history
      this.saveChatHistory();
    } catch (error) {
      console.error("Failed to send message:", error);
      this.addMessage(
        "system",
        `Error: ${error.message || "Failed to get AI response"}`
      );
      window.app.showNotification("Error", "Failed to send message", "error");
    } finally {
      // Re-enable input
      messageInput.disabled = false;
      sendBtn.disabled = false;
      this.hideTypingIndicator();
      messageInput.focus();
    }
  }

  addMessage(type, content, timestamp = new Date()) {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp,
    };

    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();

    // Update AI status
    this.updateAIStatus();
  }

  renderMessage(message) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    // Remove welcome message if it exists
    const welcomeMessage = chatMessages.querySelector(".welcome-message");
    if (welcomeMessage && this.messages.length === 1) {
      welcomeMessage.remove();
    }

    const messageEl = document.createElement("div");
    messageEl.className = `message ${message.type}`;
    messageEl.setAttribute("data-message-id", message.id);

    const avatar = this.getMessageAvatar(message.type);
    const time = window.app.formatTime(message.timestamp);

    messageEl.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessageContent(
                      message.content
                    )}</div>
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;

    chatMessages.appendChild(messageEl);

    // Animate message appearance
    setTimeout(() => {
      messageEl.classList.add("fade-in");
    }, 50);
  }

  getMessageAvatar(type) {
    switch (type) {
      case "user":
        return '<i class="fas fa-user"></i>';
      case "ai":
        return '<i class="fas fa-robot"></i>';
      case "system":
        return '<i class="fas fa-info-circle"></i>';
      default:
        return '<i class="fas fa-comment"></i>';
    }
  }

  formatMessageContent(content) {
    // Convert markdown-style formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    // Handle code blocks
    formatted = formatted.replace(
      /```([\s\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    );

    // Handle links
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" onclick="window.electronAPI.openExternal(\'$1\')" class="message-link">$1</a>'
    );

    return formatted;
  }

  showTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
      this.isTyping = true;
      typingIndicator.style.display = "flex";
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typingIndicator");
    if (typingIndicator) {
      this.isTyping = false;
      typingIndicator.style.display = "none";
    }
  }

  scrollToBottom() {
    const chatMessages = document.getElementById("chatMessages");
    if (chatMessages) {
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    }
  }

  clearChat() {
    if (confirm("Are you sure you want to clear all messages?")) {
      this.messages = [];
      const chatMessages = document.getElementById("chatMessages");

      if (chatMessages) {
        chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <h3>Welcome to Floating AI Assistant</h3>
                        <p>Start a conversation with your AI assistant. Use <strong>Ctrl+Shift+A</strong> to toggle the window from anywhere.</p>
                    </div>
                `;
      }

      this.saveChatHistory();
      window.app.showNotification(
        "Success",
        "Chat cleared successfully",
        "success"
      );
    }
  }

  clearInput() {
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    if (messageInput) {
      messageInput.value = "";
      messageInput.style.height = "80px";
      messageInput.focus();
    }

    if (sendBtn) {
      sendBtn.disabled = true;
    }
  }

  async pasteFromClipboard() {
    try {
      const clipboardText = await window.electronAPI.readClipboard();
      const messageInput = document.getElementById("messageInput");

      if (messageInput && clipboardText) {
        messageInput.value = clipboardText;
        messageInput.dispatchEvent(new Event("input"));
        messageInput.focus();

        // Trigger auto-resize
        messageInput.style.height = "auto";
        const newHeight = Math.min(
          Math.max(messageInput.scrollHeight, 80),
          200
        );
        messageInput.style.height = newHeight + "px";
      }
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      window.app.showNotification("Error", "Failed to read clipboard", "error");
    }
  }

  async exportChat() {
    if (this.messages.length === 0) {
      window.app.showNotification("Info", "No messages to export", "info");
      return;
    }

    try {
      const chatData = {
        exportDate: new Date().toISOString(),
        messageCount: this.messages.length,
        messages: this.messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      };

      const jsonString = JSON.stringify(chatData, null, 2);
      await window.electronAPI.writeClipboard(jsonString);

      window.app.showNotification(
        "Success",
        "Chat exported to clipboard as JSON",
        "success"
      );
    } catch (error) {
      console.error("Failed to export chat:", error);
      window.app.showNotification("Error", "Failed to export chat", "error");
    }
  }

  updateAIStatus() {
    const statusIndicator = document.getElementById("statusIndicator");
    const aiName = document.getElementById("aiName");

    if (statusIndicator && aiName) {
      const provider = this.settings.aiProvider;
      const hasApiKey = this.settings.apiKeys[provider];

      if (this.isTyping) {
        statusIndicator.className = "status-indicator connecting";
        aiName.textContent = "AI is thinking...";
      } else if (hasApiKey) {
        statusIndicator.className = "status-indicator";
        aiName.textContent = this.getProviderName(provider);
      } else {
        statusIndicator.className = "status-indicator offline";
        aiName.textContent = "Not configured";
      }
    }
  }

  getProviderName(provider) {
    const names = {
      openai: "OpenAI GPT",
      gemini: "Google Gemini",
      claude: "Anthropic Claude",
    };
    return names[provider] || "AI Assistant";
  }

  loadChatHistory() {
    try {
      const saved = localStorage.getItem("floating_ai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.messages = parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        // Render messages
        this.messages.forEach((msg) => this.renderMessage(msg));
        this.scrollToBottom();
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }

  saveChatHistory() {
    try {
      const toSave = this.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      localStorage.setItem("floating_ai_chat_history", JSON.stringify(toSave));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }

  // Update settings when they change
  updateSettings(newSettings) {
    this.settings = newSettings;
    this.updateAIStatus();
  }
}

// Make available globally
window.ChatManager = ChatManager;
