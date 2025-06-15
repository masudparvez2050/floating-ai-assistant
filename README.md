# Floating AI Assistant - Windows Desktop App

A professional floating AI assistant for Windows that provides seamless access to multiple AI providers (OpenAI, Gemini, Claude) in a beautiful, always-accessible interface.

## 🌟 Features

- **Multi-AI Provider Support**: OpenAI GPT-4, Google Gemini, and Anthropic Claude
- **Floating Window**: Always-on-top, resizable, and customizable interface
- **Modern UI**: Glassmorphism design with dark/light theme support
- **Global Shortcuts**: Quick access with keyboard shortcuts (Alt+Space, Alt+A)
- **System Tray Integration**: Minimize to tray with context menu
- **Chat History**: Persistent conversation history with search
- **Settings Management**: Easy API key configuration and preferences
- **Microsoft Store Ready**: APPX packaging for Windows Store distribution
- **Professional Build**: Code-signed and optimized for Windows 10/11

## 🚀 Installation

### From Microsoft Store (Recommended)

- Search for "Floating AI Assistant" in Microsoft Store
- Click Install and launch

### From Release Package

1. Download the latest `Floating AI Assistant Setup.exe` from [Releases](https://github.com/codevionix/floating-ai-assistant/releases)
2. Run the installer and follow the setup wizard
3. Launch from Start Menu or Desktop shortcut

### Development Installation

```bash
# Clone the repository
git clone https://github.com/codevionix/floating-ai-assistant
cd floating-ai-assistant/pc_float_ai_assistant

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

## ⚡ Quick Start

1. **Setup API Keys**: Open Settings (Ctrl+,) and configure your preferred AI provider:

   - OpenAI: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Gemini: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Claude: Get API key from [Anthropic Console](https://console.anthropic.com/)

2. **Start Chatting**: Type your message and press Enter or click Send

3. **Global Access**: Use Alt+Space to show/hide the assistant from anywhere

## 🎨 Interface

### Main Window

- **Chat Area**: Clean conversation interface with message bubbles
- **Input Field**: Multi-line text input with send button
- **Settings Panel**: Slide-out configuration panel
- **Window Controls**: Minimize, maximize, and close buttons

### System Tray

- **Quick Actions**: Show/hide, settings, always-on-top toggle
- **About**: Version information and links
- **Quit**: Complete application exit

## ⌨️ Keyboard Shortcuts

- `Alt + Space`: Show/Hide assistant
- `Alt + A`: Show assistant and focus input
- `Ctrl + N`: New chat (clear history)
- `Ctrl + ,`: Open settings
- `Ctrl + T`: Toggle always-on-top
- `Ctrl + H`: Hide to tray
- `Ctrl + R`: Reload application
- `Ctrl + Q`: Quit application
- `F1`: Show help dialog

## 🔧 Configuration

### Settings Options

- **AI Provider**: Choose between OpenAI, Gemini, or Claude
- **API Keys**: Secure storage of authentication credentials
- **Model Selection**: Choose specific AI models (GPT-4, Gemini Pro, etc.)
- **Theme**: Dark or Light mode
- **Window Behavior**: Always-on-top, startup behavior
- **Shortcuts**: Customize global hotkeys

### Data Storage

- Settings: `%APPDATA%/floating-ai-assistant/config.json`
- Chat History: `%APPDATA%/floating-ai-assistant/chats.json`
- Logs: `%APPDATA%/floating-ai-assistant/logs/`

## 🏗️ Development

### Architecture

- **Electron**: Desktop app framework
- **Main Process**: Window management, IPC handlers, system integration
- **Renderer Process**: UI rendering, user interactions
- **Preload Script**: Secure communication bridge
- **AI Service**: Multi-provider API integration

### Build Commands

```bash
npm start          # Development mode
npm run build      # Production build (all targets)
npm run dist       # Create distribution packages
npm run pack       # Pack without creating installers
```

### Project Structure

```
pc_float_ai_assistant/
├── src/
│   ├── main.js           # Electron main process
│   ├── preload.js        # Security bridge
│   ├── index.html        # Main UI
│   ├── ai-service.js     # AI provider integration
│   ├── scripts/          # Frontend JavaScript
│   └── styles/           # CSS styling
├── assets/               # Icons and resources
├── dist/                 # Build output
└── package.json          # Configuration
```

## 📦 Building for Distribution

### Microsoft Store (APPX)

```bash
npm run build  # Creates .appx files for x64 and ARM64
```

### Standard Installer (NSIS)

```bash
npm run build  # Creates .exe installer
```

### Requirements

- Windows 10/11 (x64 or ARM64)
- .NET Framework 4.7.2 or later
- 100MB free disk space
- Internet connection for AI services

## 🔐 Security & Privacy

- **Local Data**: All settings and chat history stored locally
- **API Keys**: Encrypted storage using electron-store
- **No Tracking**: No analytics or user data collection
- **Secure Communication**: HTTPS only for AI API calls
- **Sandboxed**: Electron security best practices implemented

## 🛠️ Troubleshooting

### Common Issues

**App won't start**

- Check Windows version compatibility (Windows 10 1903+)
- Run as administrator if needed
- Check antivirus software blocking

**API errors**

- Verify API key validity and format
- Check internet connection
- Ensure sufficient API credits/quota

**Performance issues**

- Reduce chat history size in settings
- Disable unnecessary animations
- Check available system memory

### Support

- [GitHub Issues](https://github.com/codevionix/floating-ai-assistant/issues)
- [Documentation](https://floating-ai-assistant.docs.com)
- Email: support@codevionix.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🚀 Roadmap

- [ ] Voice input/output support
- [ ] Custom AI model integration
- [ ] Plugin system
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Advanced customization options

## 📊 System Requirements

**Minimum:**

- Windows 10 version 1903 (build 18362)
- 4GB RAM
- 200MB available storage
- DirectX 11 compatible graphics

**Recommended:**

- Windows 11
- 8GB RAM
- 500MB available storage
- Hardware acceleration support

---

**Made with ❤️ by [CodeVionix](https://masudur-rahman.vercel.app)**

_Transform your workflow with intelligent AI assistance, always at your fingertips._
