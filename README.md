<p align="center">
  <h1 align="center">Moonlight Tizen Installer</h1>
  <p align="center">🎮 Install Moonlight on Samsung Tizen TVs with automatic certificate signing.</p>
  <p align="center">
    <img src="https://img.shields.io/badge/license-GPL--3.0-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/docker-ready-blue.svg" alt="Docker">
    <img src="https://img.shields.io/badge/electron-ready-blue.svg" alt="Electron">
    <img src="https://img.shields.io/badge/platform-linux%20%7C%20windows%20%7C%20macos-lightgrey.svg" alt="Platform">
  </p>
</p>

---

## 📝 Table of Contents

- [🧐 About](#-about)
- [⚡ Features](#-features)
- [📋 Requirements](#-requirements)
- [💻 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🔧 Technical Details](#-technical-details)
- [💬 Support](#-support)

## 🧐 About

**Moonlight Tizen Installer** is a desktop application that simplifies installing [Moonlight](https://github.com/OneLiberty/moonlight-chrome-tizen) on Samsung Tizen Smart TVs. It handles the complex process of connecting to your TV via SDB (Smart Development Bridge), automatically signing packages with Samsung certificates (required for Tizen 7+), and installing the app.

## ⚡ Features

| Feature | Status | Description |
|---------|--------|-------------|
| One-Click Install | ✅ | Install Moonlight with a single click |
| Auto Certificate | ✅ | Automatically creates Samsung certificates for Tizen 7+ |
| Desktop App | ✅ | Native Electron app for Windows, macOS, and Linux |
| Docker Support | ✅ | Run as a container for headless/server setups |
| Custom Repos | ✅ | Install from any GitHub repository |
| TV Detection | ✅ | Shows connected TV model and Tizen version |

## 📋 Requirements

### TV Setup

Before using the installer, you need to enable Developer Mode on your Samsung TV:

1. On the TV, open the **Smart Hub** and go to the **Apps** panel
2. Scroll down to find **App Settings** (in the Settings section)
3. In the App Settings screen, enter **12345** using your remote control
4. The **Developer Mode** dialog will appear:
   - Toggle **Developer Mode** to **ON**
   - Enter your computer's **IP address** in the Host PC IP field
5. A popup will tell you to restart the TV
6. **Hold the power button for 2 seconds** until the TV turns off, then turn it back on
7. After reboot, you'll see **"DEVELOP MODE"** at the top of the Apps panel

> ⚠️ **Important**: The Host PC IP must be the IP address of the computer running this installer. Both devices must be on the same network.

> 📖 For more details, see [Samsung's Developer Guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK)

### System Requirements

| Platform | Requirement |
|----------|-------------|
| Windows | Windows 10+ |
| macOS | macOS 10.15+ |
| Linux | Any modern distribution |
| Docker | Docker 20.10+ |

## 💻 Installation

### Option 1: Desktop App (Recommended)

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| Windows | [.exe installer](https://github.com/SmookeyDev/MoonlightTizenInstaller/releases/latest) |
| macOS | [.dmg image](https://github.com/SmookeyDev/MoonlightTizenInstaller/releases/latest) |
| Linux | [.AppImage](https://github.com/SmookeyDev/MoonlightTizenInstaller/releases/latest) |

### Option 2: Docker

```bash
docker run -d \
  --name moonlight-installer \
  -p 8091:8091 \
  -p 4794:4794 \
  -v moonlight-config:/root/share \
  ghcr.io/smookeydev/moonlighttizeninstaller:latest
```

Access the installer at `http://localhost:8091`

### Option 3: From Source

```bash
# Clone repository
git clone https://github.com/SmookeyDev/MoonlightTizenInstaller.git
cd MoonlightTizenInstaller

# Install dependencies
npm install

# Build UI and service
npm run build

# Run the service
npm run dev
```

## 🚀 Usage

### Installation Flow

```
1. Launch App        →  Open the installer on your PC
2. Enter TV IP       →  Type your TV's IP address and click Connect
3. TV Detection      →  App shows TV model and Tizen version
4. Install           →  Click "Install Moonlight"
5. Sign In (Tizen 7+)→  Sign in to Samsung Account for certificate
6. Done              →  Moonlight is installed on your TV!
```

### Step-by-Step Guide

1. **Launch the installer** on your computer
2. **Enter your TV's IP address** (find it in TV Settings → Network)
3. **Click Connect** - the app will show your TV model and Tizen version
4. **Click "Install Moonlight"**
5. **For Tizen 7+ TVs**: A Samsung login window will open
   - Sign in to your Samsung Account
   - This creates a certificate to sign the app
   - Only required once - certificate is saved for future installs
6. **Wait for installation** to complete
7. **Find Moonlight** in your TV's app list!

### Ports

| Port | Protocol | Description |
|------|----------|-------------|
| 8091 | TCP | Web interface |
| 4794 | TCP | Samsung OAuth callback |
| 26101 | TCP | SDB connection to TV |

## 🔧 Technical Details

### How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your PC       │     │    Installer    │     │   Samsung TV    │
│                 │     │                 │     │                 │
│  ┌───────────┐  │     │  ┌───────────┐  │     │  ┌───────────┐  │
│  │ Electron  │──┼─────┼─▶│  Service  │──┼─────┼─▶│    SDB    │  │
│  │    App    │  │     │  │  (Node)   │  │     │  │  Daemon   │  │
│  └───────────┘  │     │  └───────────┘  │     │  └───────────┘  │
│                 │     │        │        │     │        │        │
│                 │     │        ▼        │     │        ▼        │
│                 │     │  ┌───────────┐  │     │  ┌───────────┐  │
│                 │     │  │  GitHub   │  │     │  │ Moonlight │  │
│                 │     │  │ Download  │  │     │  │ Installed │  │
│                 │     │  └───────────┘  │     │  └───────────┘  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Certificate Flow (Tizen 7+)

Samsung requires apps to be signed with a valid certificate on Tizen 7+:

```
1. User clicks Install       →  Check if certificate exists
2. No certificate found      →  Open Samsung OAuth login
3. User signs in             →  Receive access token
4. Create certificate        →  Generate author + distributor certs
5. Save certificate          →  Store encrypted in config
6. Resign package            →  Sign .wgt with new certificate
7. Install on TV             →  Push via SDB and install
```

### Build Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run build` | Build UI and service |
| `npm run dev` | Start development server |
| `npm run electron` | Run Electron app |
| `npm run electron:build` | Build Electron distributable |

## 💬 Support

For help and support:

- 🐛 **Issues**: [Create an issue](https://github.com/SmookeyDev/MoonlightTizenInstaller/issues)
- 💡 **Feature Requests**: Submit via GitHub issues
- 🌙 **Moonlight**: [moonlight-chrome-tizen](https://github.com/OneLiberty/moonlight-chrome-tizen)

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Developed with ❤️ by SmookeyDev</sub>
  <br>
  <sub>Based on <a href="https://github.com/reisxd/TizenBrewInstaller">TizenBrew Installer</a> by reisxd</sub>
</div>
