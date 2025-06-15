const axios = require("axios");

class AIService {
  constructor() {
    this.providers = {
      openai: this.callOpenAI.bind(this),
      gemini: this.callGemini.bind(this),
      claude: this.callClaude.bind(this),
    };
  }

  async sendMessage(provider, apiKey, message, model = null) {
    if (!this.providers[provider]) {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    if (!apiKey) {
      throw new Error(`API key required for ${provider}`);
    }

    try {
      return await this.providers[provider](apiKey, message, model);
    } catch (error) {
      console.error(`AI Service Error (${provider}):`, error);
      throw new Error(this.formatError(error, provider));
    }
  }

  async callOpenAI(apiKey, message, model = "gpt-4-turbo") {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model || "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    if (response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message.content;
      return typeof content === "string"
        ? content
        : String(content || "No response");
    } else {
      throw new Error("Invalid response from OpenAI");
    }
  }
  async callGemini(apiKey, message, model = "gemini-2.0-flash") {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.data.candidates && response.data.candidates[0]) {
      const candidate = response.data.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts[0]
      ) {
        return candidate.content.parts[0].text;
      }
    }

    throw new Error("Invalid response from Gemini");
  }

  async callClaude(apiKey, message, model = "claude-3-sonnet-20240229") {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: model || "claude-3-sonnet-20240229",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (response.data.content && response.data.content[0]) {
      return response.data.content[0].text;
    } else {
      throw new Error("Invalid response from Claude");
    }
  }

  formatError(error, provider) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return `Invalid API key for ${provider}. Please check your API key in settings.`;
        case 403:
          return `Access forbidden. Please check your API key permissions for ${provider}.`;
        case 429:
          return `Rate limit exceeded for ${provider}. Please try again later.`;
        case 500:
        case 502:
        case 503:
          return `${provider} service is temporarily unavailable. Please try again later.`;
        default:
          if (data && data.error) {
            return data.error.message || data.error;
          }
          return `HTTP ${status} error from ${provider}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return `Request timeout for ${provider}. Please check your internet connection.`;
    } else if (error.code === "ENOTFOUND") {
      return `Network error: Unable to reach ${provider}. Please check your internet connection.`;
    } else {
      return error.message || `Unknown error with ${provider}`;
    }
  }

  // Validate API key format
  validateApiKey(provider, apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      return false;
    }

    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      gemini: /^AI[a-zA-Z0-9_-]{35,}$/,
      claude: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
    };

    const pattern = patterns[provider];
    return pattern ? pattern.test(apiKey) : apiKey.length > 10;
  }

  // Get available models for each provider
  getAvailableModels(provider) {
    const models = {
      openai: [
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          description: "Most capable model",
        },
        { id: "gpt-4", name: "GPT-4", description: "High-quality responses" },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          description: "Fast and efficient",
        },
      ],
      gemini: [
        {
          id: "gemini-2.0-flash",
          name: "Gemini 2.0 Flash",
          description: "Google's fast model",
        },
        {
          id: "gemini-2.0-flash-lite",
          name: "Gemini 2.0 Flash Lite",
          description: "Google's most capable model",
        },
      ],
      claude: [
        {
          id: "claude-3-sonnet-20240229",
          name: "Claude 3 Sonnet",
          description: "Balanced performance",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          description: "Fast responses",
        },
        {
          id: "claude-2.1",
          name: "Claude 2.1",
          description: "Previous generation",
        },
      ],
    };

    return models[provider] || [];
  }
}

module.exports = AIService;
