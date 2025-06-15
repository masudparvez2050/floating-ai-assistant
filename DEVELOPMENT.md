# Development Guide - Floating AI Assistant

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ and npm
- Windows 10/11
- Git
- Code editor (VS Code recommended)

### Quick Start

```bash
# Clone and setup
git clone https://github.com/codevionix/floating-ai-assistant
cd floating-ai-assistant/pc_float_ai_assistant
npm install

# Development mode with DevTools
npm run dev

# Production build
npm run build
```

## 🏗️ Project Architecture

### File Structure

```
src/
├── main.js              # Electron main process
├── preload.js           # IPC security bridge
├── index.html           # Main UI
├── ai-service.js        # AI provider integration
├── scripts/
│   ├── app.js          # Main app controller
│   ├── chat.js         # Chat functionality
│   ├── settings.js     # Settings management
│   └── shortcuts.js    # Keyboard shortcuts
└── styles/
    ├── main.css        # Core styling
    ├── chat.css        # Chat interface
    └── settings.css    # Settings panel
```

### Key Components

#### Main Process (main.js)

- Window management and lifecycle
- System tray integration
- Global shortcuts registration
- IPC handlers for renderer communication
- AI service integration

#### Renderer Process (scripts/)

- UI rendering and interactions
- Chat message management
- Settings persistence
- Theme switching
- Keyboard shortcuts

#### AI Service (ai-service.js)

- Multi-provider API integration
- Error handling and retries
- Response formatting
- API key validation

## 🔧 Development Commands

```bash
npm start          # Start app in development
npm run dev        # Start with DevTools open
npm run build      # Build all targets (APPX + NSIS)
npm run pack       # Pack app without installers
npm run dist       # Create distribution packages
```

## 🧪 Testing

### Manual Testing Checklist

#### Basic Functionality

- [ ] App starts without errors
- [ ] UI renders correctly
- [ ] Chat input accepts text
- [ ] Send button works
- [ ] Global shortcuts respond (Alt+Space, Alt+A)

#### AI Integration

- [ ] OpenAI API connection works
- [ ] Gemini API connection works
- [ ] Claude API connection works
- [ ] Error messages display properly
- [ ] API key validation works

#### Window Management

- [ ] Always-on-top toggle works
- [ ] Window resizing functions
- [ ] Minimize to tray works
- [ ] Restore from tray works
- [ ] Window position saves/restores

#### Settings

- [ ] Settings panel opens/closes
- [ ] API keys save securely
- [ ] Theme switching works
- [ ] Provider selection functions
- [ ] Settings persist across restarts

#### System Integration

- [ ] Tray icon appears
- [ ] Context menu functions
- [ ] Desktop shortcut created (after install)
- [ ] Start menu entry created (after install)

### Debugging

#### Enable DevTools

```bash
npm run dev  # Automatically opens DevTools
```

#### Console Logging

Check these areas for errors:

- Main process: Terminal output
- Renderer process: DevTools console
- AI service: Network tab in DevTools

#### Common Issues

1. **IPC Handler Missing**: Check main.js setupIpcHandlers()
2. **API Errors**: Verify API keys and network connectivity
3. **UI Not Loading**: Check index.html and CSS file paths
4. **Build Failures**: Ensure icon files are correct size/format

## 📦 Building & Distribution

### Build Targets

#### Microsoft Store (APPX)

```bash
npm run build  # Creates .appx for x64 and ARM64
```

- Unsigned packages ready for Store submission
- Requires Microsoft Partner Center account
- Automatic updates through Store

#### Standard Installer (NSIS)

```bash
npm run build  # Creates .exe installer
```

- Self-contained installer
- Desktop and Start Menu shortcuts
- Uninstaller included

### Build Configuration

Key settings in `package.json`:

```json
"build": {
  "appId": "com.codevionix.floating-ai-assistant",
  "win": {
    "target": ["appx", "nsis"],
    "icon": "assets/icon256.png"
  },
  "appx": {
    "applicationId": "CodeVionix.FloatingAIAssistant",
    "publisher": "CN=CodeVionix"
  }
}
```

### Icon Requirements

- Main icon: 256x256 PNG minimum
- Tray icon: 16x16 PNG recommended
- ICO format supported but PNG preferred for builds

## 🔐 Security Considerations

### Electron Security

- Context isolation enabled
- Node integration disabled in renderer
- Preload script for secure IPC
- Remote module disabled

### API Key Storage

- Encrypted using electron-store
- Local storage only (no cloud sync)
- Keys never logged or transmitted except to AI providers

### Code Signing

For production releases:

1. Obtain code signing certificate
2. Add certificate to build configuration
3. Sign both APPX and NSIS packages

## 🚀 Release Process

### Version Bumping

1. Update version in `package.json`
2. Update version references in README
3. Create git tag: `git tag v1.0.1`

### Build Release Packages

```bash
# Clean build
rm -rf dist/
npm run build

# Verify packages
ls dist/
```

### GitHub Release

1. Create release on GitHub
2. Upload `Floating AI Assistant Setup 1.0.0.exe`
3. Upload both APPX files for Store submission
4. Include release notes

### Microsoft Store Submission

1. Upload APPX to Partner Center
2. Fill metadata and screenshots
3. Submit for certification
4. Manage updates through Partner Center

## 📱 Features Roadmap

### Planned Features

- [ ] Voice input/output
- [ ] Custom AI models
- [ ] Plugin system
- [ ] Multi-language UI
- [ ] Team collaboration
- [ ] Advanced theming

### Technical Improvements

- [ ] Auto-updater implementation
- [ ] Performance optimizations
- [ ] Memory usage reduction
- [ ] Startup time improvement
- [ ] Better error handling

## 🐛 Troubleshooting

### Development Issues

**Build Fails**

```bash
# Clear node_modules and reinstall
rm -rf node_modules/
npm install
```

**App Won't Start**

- Check main.js syntax errors
- Verify file paths in loadFile()
- Check for missing dependencies

**IPC Errors**

- Ensure handlers are registered in main.js
- Check preload.js exposes correct APIs
- Verify renderer calls match handler names

### Production Issues

**Installer Problems**

- Run as administrator
- Check Windows Defender settings
- Verify system requirements

**Performance Issues**

- Clear chat history
- Check available RAM
- Disable unnecessary features

## 📞 Support

### Documentation

- README.md: User guide
- This file: Developer guide
- Inline code comments

### Community

- GitHub Issues: Bug reports
- GitHub Discussions: Feature requests
- Email: support@codevionix.com

---

**Happy coding! 🚀**
