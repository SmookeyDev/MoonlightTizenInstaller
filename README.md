# Moonlight Tizen Installer

Install Moonlight on Samsung Tizen TVs easily, with automatic resigning support for Tizen 7+ TVs.

## Requirements

- Samsung TV with Developer Mode enabled
- PC, Mac, Linux, or Android device (via Termux)

## Installation Options

### Option 1: Electron Desktop App

Download the latest release from the [releases section](https://github.com/SmookeyDev/MoonlightTizenInstaller/releases/latest).

### Option 2: Docker (for Termux/servers)

```bash
git clone https://github.com/SmookeyDev/MoonlightTizenInstaller.git
cd MoonlightTizenInstaller/docker
docker-compose up -d
```

Access the installer at `http://localhost:8091`

### Option 3: Manual Installation

1. Install [Node.js](https://nodejs.org/) (on Android/Termux: `pkg install nodejs`)

2. Install [git](https://git-scm.com/) (on Android/Termux: `pkg install git`)

3. Clone the repository:
   ```bash
   git clone https://github.com/SmookeyDev/MoonlightTizenInstaller.git
   ```

4. Build the UI:
   ```bash
   cd MoonlightTizenInstaller/client/ui
   npm install --force && npm run build
   ```

5. Install service dependencies:
   ```bash
   cd ../services/tizenbrew-installer-service
   npm install
   ```

6. Run the service:
   ```bash
   node .
   ```

7. Open `http://localhost:8091` in your browser

## TV Setup

1. Enable Developer Mode on your Samsung TV
2. Set the Host PC IP to `127.0.0.1` (or `1.0.0.127` for RTL languages)
3. Follow [Samsung's guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html#Connecting-the-TV-and-SDK) for more details

## Building from Source

### Electron App

```bash
cd electron
npm install
npm run build
```

### Docker Image

```bash
cd docker
docker-compose build
```

## Credits

- Based on [TizenBrew Installer](https://github.com/reisxd/TizenBrewInstaller) by reisxd
- [Moonlight Tizen](https://github.com/OneLiberty/moonlight-chrome-tizen)
