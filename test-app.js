// Quick test script to verify AI service functionality
const AIService = require("./src/ai-service.js");

async function testAIService() {
  const aiService = new AIService();

  console.log("Testing AI Service...");

  // Test API key validation
  console.log("Testing API key validation:");
  console.log(
    "OpenAI valid key:",
    aiService.validateApiKey(
      "openai",
      "sk-1234567890abcdef1234567890abcdef1234567890abcdef12"
    )
  );
  console.log(
    "OpenAI invalid key:",
    aiService.validateApiKey("openai", "invalid-key")
  );

  console.log(
    "Gemini valid key:",
    aiService.validateApiKey(
      "gemini",
      "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345678"
    )
  );
  console.log(
    "Gemini invalid key:",
    aiService.validateApiKey("gemini", "invalid-key")
  );

  console.log(
    "Claude valid key:",
    aiService.validateApiKey(
      "claude",
      "sk-ant-api03-abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr"
    )
  );
  console.log(
    "Claude invalid key:",
    aiService.validateApiKey("claude", "invalid-key")
  );

  // Test available models
  console.log("\nAvailable models:");
  console.log("OpenAI models:", aiService.getAvailableModels("openai"));
  console.log("Gemini models:", aiService.getAvailableModels("gemini"));
  console.log("Claude models:", aiService.getAvailableModels("claude"));

  console.log("\nTest completed successfully!");
}

testAIService().catch(console.error);
